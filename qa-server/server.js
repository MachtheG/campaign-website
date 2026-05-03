const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({ origin: ['http://localhost:3001', 'http://localhost:8080', 'http://127.0.0.1:3001'] }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(__dirname));

// Rate limiting
const questionLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many questions. Please wait an hour.' } });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many admin requests.' } });
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', generalLimiter);

// Admin PIN (SHA-256 of "2026")
const ADMIN_PIN_HASH = crypto.createHash('sha256').update('2026').digest('hex');

function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_PIN_HASH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

const DATA_FILE = path.join(__dirname, 'questions.json');
let questions = [];
let nextQuestionId = 1;

function loadQuestions() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      questions = saved.questions || [];
      nextQuestionId = saved.nextQuestionId || 1;
      console.log(`Loaded ${questions.length} questions`);
    }
  } catch (e) { console.error('Load error:', e); questions = []; }
}

function saveQuestions() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ questions, nextQuestionId, lastSaved: new Date().toISOString() }, null, 2));
  } catch (e) { console.error('Save error:', e); }
}

loadQuestions();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();

function broadcast(data, exclude = null) {
  const msg = JSON.stringify(data);
  clients.forEach(c => { if (c !== exclude && c.readyState === WebSocket.OPEN) c.send(msg); });
}

function moderateQuestion(text) {
  if (!text || text.trim().length < 3) return { ok: false, reason: 'Question too short.' };
  if (text.length > 2000) return { ok: false, reason: 'Question too long (max 2000 chars).' };
  const banned = ['spam','hate','scam','offensive'];
  if (banned.some(w => text.toLowerCase().includes(w))) return { ok: false, reason: 'Question contains inappropriate language.' };
  return { ok: true };
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'welcome', message: "Welcome to Maureen's Community Forum!", activeUsers: clients.size }));
  ws.send(JSON.stringify({ type: 'history', questions: questions.slice(-100) }));
  broadcast({ type: 'userCount', count: clients.size });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data.type === 'question') {
        const name = (data.name || 'Karen Resident').trim().substring(0, 50);
        const question = (data.question || '').trim().substring(0, 2000);
        const mod = moderateQuestion(question);
        if (!mod.ok) { ws.send(JSON.stringify({ type: 'error', message: mod.reason })); return; }
        const q = { id: nextQuestionId++, name, question, timestamp: new Date().toISOString(), votes: 0, answered: false, answer: null, answerTimestamp: null, flagged: false };
        questions.unshift(q);
        if (questions.length > 500) questions = questions.slice(0, 500);
        saveQuestions();
        broadcast({ type: 'newQuestion', question: q });
        ws.send(JSON.stringify({ type: 'questionSubmitted', id: q.id, message: 'Question submitted!' }));
      } else if (data.type === 'vote') {
        const q = questions.find(x => x.id === data.questionId);
        if (q) { q.votes += data.voteType === 'up' ? 1 : -1; saveQuestions(); broadcast({ type: 'voteUpdate', questionId: q.id, votes: q.votes }); }
      }
    } catch (e) { ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' })); }
  });

  ws.on('close', () => { clients.delete(ws); broadcast({ type: 'userCount', count: clients.size }); });
  ws.on('error', () => clients.delete(ws));
});

// Public API
app.get('/api/questions', (req, res) => res.json({ total: questions.length, questions }));
app.get('/api/questions/:id', (req, res) => {
  const q = questions.find(x => x.id === parseInt(req.params.id));
  q ? res.json(q) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/stats', (req, res) => res.json({ total: questions.length, answered: questions.filter(q => q.answered).length, pending: questions.filter(q => !q.answered).length }));

// Contribution counter (anonymous)
let contributionCount = 0;
const CONTRIB_FILE = path.join(__dirname, 'contributions.json');
try { if (fs.existsSync(CONTRIB_FILE)) contributionCount = JSON.parse(fs.readFileSync(CONTRIB_FILE)).count || 0; } catch(e) {}
app.post('/api/contribute', questionLimiter, (req, res) => {
  contributionCount++;
  fs.writeFileSync(CONTRIB_FILE, JSON.stringify({ count: contributionCount }));
  broadcast({ type: 'contributionUpdate', count: contributionCount });
  res.json({ success: true, count: contributionCount });
});
app.get('/api/contributions', (req, res) => res.json({ count: contributionCount }));

// Admin PIN verify
app.post('/api/admin/verify', adminLimiter, (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN required' });
  const hash = crypto.createHash('sha256').update(String(pin)).digest('hex');
  hash === ADMIN_PIN_HASH ? res.json({ success: true, token: ADMIN_PIN_HASH }) : res.status(401).json({ error: 'Invalid PIN' });
});

// Admin routes
app.post('/api/questions/:id/answer', adminLimiter, verifyAdmin, (req, res) => {
  const q = questions.find(x => x.id === parseInt(req.params.id));
  if (!q || !req.body.answer) return res.status(404).json({ error: 'Not found' });
  q.answered = true; q.answer = req.body.answer.substring(0, 5000); q.answerTimestamp = new Date().toISOString();
  saveQuestions();
  broadcast({ type: 'questionAnswered', questionId: q.id, answer: q.answer });
  res.json({ success: true });
});

app.delete('/api/questions/:id', adminLimiter, verifyAdmin, (req, res) => {
  const idx = questions.findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  questions.splice(idx, 1);
  saveQuestions();
  broadcast({ type: 'questionDeleted', questionId: parseInt(req.params.id) });
  res.json({ success: true });
});

app.post('/api/questions/:id/flag', adminLimiter, verifyAdmin, (req, res) => {
  const q = questions.find(x => x.id === parseInt(req.params.id));
  if (!q) return res.status(404).json({ error: 'Not found' });
  q.flagged = !q.flagged;
  saveQuestions();
  broadcast({ type: 'questionFlagged', questionId: q.id, flagged: q.flagged });
  res.json({ success: true, flagged: q.flagged });
});

app.delete('/api/questions/bulk', adminLimiter, verifyAdmin, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
  ids.forEach(id => { const i = questions.findIndex(x => x.id === id); if (i !== -1) questions.splice(i, 1); });
  saveQuestions();
  broadcast({ type: 'bulkDeleted', ids });
  res.json({ success: true });
});

app.get('/', (req, res) => res.send('<h1>Campaign QA Server Running</h1><p><a href="/api/questions">API</a></p>'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`\n🚀 Server on port ${PORT}\n🔐 Admin PIN: 2026\n📡 WS: ws://localhost:${PORT}\n`));

process.on('SIGINT', () => { saveQuestions(); clients.forEach(c => c.close()); server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { saveQuestions(); process.exit(0); });