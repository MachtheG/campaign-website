const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

const DEFAULT_ALLOWED_ORIGINS = [
  'https://votemaureen4karen.co.ke',
  'https://www.votemaureen4karen.co.ke',
  'https://maureen-campaign-qa.onrender.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://api.votemaureen4karen.co.ke'
].join(',');

const ALLOW_ALL_ORIGINS = String(process.env.CORS_ALLOW_ALL || 'false') === 'true';
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (ALLOW_ALL_ORIGINS) return true;
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '20kb' }));

const SITE_ROOT = path.join(__dirname, '..');
app.use(express.static(SITE_ROOT));
app.use(express.static(__dirname));

const API_WINDOW = 15 * 60 * 1000;
const questionLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 40, message: { error: 'Too many questions. Please wait.' } });
const adminLimiter = rateLimit({ windowMs: API_WINDOW, max: 80, message: { error: 'Too many admin requests.' } });
const formsLimiter = rateLimit({ windowMs: API_WINDOW, max: 20, message: { error: 'Too many submissions. Please wait.' } });
const generalLimiter = rateLimit({ windowMs: API_WINDOW, max: 300 });
app.use('/api', generalLimiter);

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '12h';

const DATA_FILE = path.join(__dirname, 'questions.json');
const CONTRIB_FILE = path.join(__dirname, 'contributions.json');
const FORMS_FILE = path.join(__dirname, 'form-submissions.json');

let questions = [];
let participants = {};
let nextQuestionId = 1;
let contributionCount = 0;

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function now() {
  return new Date().toISOString();
}

function safeReadJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function safeWriteJSON(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function loadState() {
  const saved = safeReadJSON(DATA_FILE, null);
  if (saved) {
    questions = Array.isArray(saved.questions) ? saved.questions : [];
    participants = saved.participants && typeof saved.participants === 'object' ? saved.participants : {};
    nextQuestionId = Number.isInteger(saved.nextQuestionId) ? saved.nextQuestionId : 1;
  }

  const contrib = safeReadJSON(CONTRIB_FILE, { count: 0 });
  contributionCount = Number(contrib.count || 0);
}

function saveState() {
  safeWriteJSON(DATA_FILE, {
    questions,
    participants,
    nextQuestionId,
    lastSaved: now()
  });
}

function appendFormSubmission(type, payload, delivered) {
  const existing = safeReadJSON(FORMS_FILE, { submissions: [] });
  existing.submissions.unshift({
    type,
    payload,
    delivered,
    timestamp: now()
  });
  existing.submissions = existing.submissions.slice(0, 1000);
  safeWriteJSON(FORMS_FILE, existing);
}

loadState();

const defaultUsers = [
  { username: 'admin', passwordHash: hash('MachAdmin@1039'), role: 'admin', displayName: 'System Admin' },
  { username: 'candidate', passwordHash: hash('MaureenChat@2027$'), role: 'candidate', displayName: 'Maureen Candidate' }
];

const configuredUsers = (() => {
  const raw = process.env.CAMPAIGN_USERS_JSON;
  if (!raw) return defaultUsers;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return defaultUsers;
    return parsed
      .filter((u) => u && u.username && u.passwordHash && u.role)
      .map((u) => ({
        username: String(u.username),
        passwordHash: String(u.passwordHash),
        role: String(u.role),
        displayName: u.displayName ? String(u.displayName) : String(u.username)
      }));
  } catch (e) {
    return defaultUsers;
  }
})();

function findUser(username) {
  return configuredUsers.find((u) => u.username.toLowerCase() === String(username || '').toLowerCase());
}

function signToken(user) {
  return jwt.sign({ sub: user.username, role: user.role, name: user.displayName }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function escText(input, maxLen) {
  return String(input || '').trim().replace(/\s+/g, ' ').slice(0, maxLen);
}

function moderateQuestion(text) {
  if (!text || text.trim().length < 3) return { ok: false, reason: 'Question too short.' };
  if (text.length > 2000) return { ok: false, reason: 'Max 2000 characters.' };
  const banned = ['spam', 'hate', 'scam', 'offensive'];
  if (banned.some((w) => text.toLowerCase().includes(w))) return { ok: false, reason: 'Contains inappropriate language.' };
  return { ok: true };
}

function participantIdFrom(name, ip) {
  return hash(`${String(name || '').toLowerCase()}|${String(ip || '')}`).slice(0, 20);
}

function ensureParticipant(participantId, displayName) {
  if (!participants[participantId]) {
    participants[participantId] = {
      id: participantId,
      displayName: displayName || 'Karen Resident',
      status: 'active',
      createdAt: now(),
      updatedAt: now()
    };
  }
  participants[participantId].displayName = displayName || participants[participantId].displayName;
  participants[participantId].updatedAt = now();
  return participants[participantId];
}

function publicQuestions() {
  return questions.filter((q) => q.status === 'approved');
}

const mailerEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const mailer = mailerEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

const FORM_FROM = process.env.FORM_FROM || 'no-reply@vote4maureen.co.ke';
const VOLUNTEER_RECIPIENTS = ['team@vote4maureen.co.ke', 'thayu@votemaureen4karen.co.ke'];
const PARTNER_RECIPIENTS = ['partner@votemaureen4karen.co.ke'];

async function sendFormEmail({ to, subject, text, html }) {
  if (!mailer) return false;
  await mailer.sendMail({ from: FORM_FROM, to, subject, text, html });
  return true;
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();

function broadcast(data, exclude = null) {
  const msg = JSON.stringify(data);
  clients.forEach((c) => {
    if (c !== exclude && c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

wss.on('connection', (ws, req) => {
  const requestOrigin = req && req.headers ? req.headers.origin : null;

  if (!isAllowedOrigin(requestOrigin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }

  clients.add(ws);
  ws.send(JSON.stringify({ type: 'welcome', activeUsers: clients.size }));
  ws.send(JSON.stringify({ type: 'history', questions: publicQuestions().slice(-100) }));
  broadcast({ type: 'userCount', count: clients.size });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data.type === 'question') {
        const name = escText(data.name || 'Karen Resident', 50) || 'Karen Resident';
        const question = escText(data.question || '', 2000);
        const mod = moderateQuestion(question);
        if (!mod.ok) {
          ws.send(JSON.stringify({ type: 'error', message: mod.reason }));
          return;
        }

        const participantId = participantIdFrom(name, ws._socket && ws._socket.remoteAddress);
        const participant = ensureParticipant(participantId, name);
        if (participant.status === 'banned') {
          ws.send(JSON.stringify({ type: 'error', message: 'Your account is restricted from posting.' }));
          return;
        }

        const q = {
          id: nextQuestionId++,
          name,
          participantId,
          question,
          timestamp: now(),
          votes: 0,
          answered: false,
          answer: null,
          answerTimestamp: null,
          status: 'pending'
        };
        questions.unshift(q);
        if (questions.length > 1000) questions = questions.slice(0, 1000);
        saveState();

        broadcast({ type: 'newQuestion', question: q });
        ws.send(JSON.stringify({ type: 'questionSubmitted', id: q.id, message: 'Question submitted and awaiting moderation.' }));
      } else if (data.type === 'vote') {
        const q = questions.find((x) => x.id === Number(data.questionId) && x.status === 'approved');
        if (q) {
          q.votes += data.voteType === 'up' ? 1 : -1;
          saveState();
          broadcast({ type: 'voteUpdate', questionId: q.id, votes: q.votes });
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast({ type: 'userCount', count: clients.size });
  });
  ws.on('error', () => clients.delete(ws));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: now() });
});

app.post('/api/auth/login', adminLimiter, (req, res) => {
  const username = escText(req.body.username, 64);
  const password = String(req.body.password || '');
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

  const user = findUser(username);
  if (!user || user.passwordHash !== hash(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    success: true,
    token: signToken(user),
    role: user.role,
    displayName: user.displayName
  });
});

app.get('/api/questions', (req, res) => {
  const visible = publicQuestions();
  res.json({ total: visible.length, questions: visible });
});

app.get('/api/questions/:id', (req, res) => {
  const q = questions.find((x) => x.id === Number(req.params.id));
  if (!q || q.status !== 'approved') return res.status(404).json({ error: 'Not found' });
  res.json(q);
});

app.get('/api/stats', (req, res) => {
  const approved = publicQuestions();
  res.json({
    total: approved.length,
    answered: approved.filter((q) => q.answered).length,
    pending: questions.filter((q) => q.status === 'pending').length,
    flagged: questions.filter((q) => q.status === 'flagged').length
  });
});

app.get('/api/moderation/questions', authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  res.json({ total: questions.length, questions });
});

app.get('/api/moderation/users', authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  const list = Object.values(participants);
  res.json({ total: list.length, users: list });
});

app.patch('/api/questions/:id/status', adminLimiter, authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  const status = String(req.body.status || '').toLowerCase();
  if (!['approved', 'pending', 'flagged'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const q = questions.find((x) => x.id === Number(req.params.id));
  if (!q) return res.status(404).json({ error: 'Question not found' });

  q.status = status;
  saveState();
  broadcast({ type: 'questionStatusUpdated', questionId: q.id, status: q.status });
  res.json({ success: true, question: q });
});

app.post('/api/questions/:id/answer', adminLimiter, authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  const q = questions.find((x) => x.id === Number(req.params.id));
  const answer = escText(req.body.answer || '', 5000);
  if (!q) return res.status(404).json({ error: 'Question not found' });
  if (!answer) return res.status(400).json({ error: 'Answer is required' });

  q.answered = true;
  q.answer = answer;
  q.answerTimestamp = now();
  if (q.status === 'pending') q.status = 'approved';

  saveState();
  broadcast({ type: 'questionAnswered', questionId: q.id, answer: q.answer, status: q.status });
  res.json({ success: true, question: q });
});

app.patch('/api/questions/:id', adminLimiter, authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  const q = questions.find((x) => x.id === Number(req.params.id));
  if (!q) return res.status(404).json({ error: 'Question not found' });

  const updatedBy = req.user && req.user.sub ? req.user.sub : 'system';

  if (Object.prototype.hasOwnProperty.call(req.body, 'question')) {
    const nextQuestion = escText(req.body.question || '', 2000);
    if (!nextQuestion || nextQuestion.length < 3) {
      return res.status(400).json({ error: 'Edited question must be at least 3 characters.' });
    }
    q.question = nextQuestion;
    q.questionEditedAt = now();
    q.questionEditedBy = updatedBy;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'answer')) {
    const nextAnswer = escText(req.body.answer || '', 5000);
    if (!nextAnswer) {
      return res.status(400).json({ error: 'Edited answer cannot be empty.' });
    }
    q.answer = nextAnswer;
    q.answered = true;
    q.answerTimestamp = now();
    q.answerEditedAt = now();
    q.answerEditedBy = updatedBy;
    if (q.status === 'pending') q.status = 'approved';
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    const status = String(req.body.status || '').toLowerCase();
    if (!['approved', 'pending', 'flagged'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    q.status = status;
  }

  saveState();
  broadcast({ type: 'questionUpdated', question: q });
  res.json({ success: true, question: q });
});

app.delete('/api/questions/:id', adminLimiter, authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  const idx = questions.findIndex((x) => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });

  const deleted = questions[idx];
  questions.splice(idx, 1);
  saveState();
  broadcast({ type: 'questionDeleted', questionId: deleted.id });
  res.json({ success: true });
});

app.patch('/api/users/:id/status', adminLimiter, authenticate, authorizeRoles('admin'), (req, res) => {
  const userId = String(req.params.id || '');
  const status = String(req.body.status || '').toLowerCase();
  if (!['active', 'banned'].includes(status)) return res.status(400).json({ error: 'Invalid user status' });

  const participant = participants[userId];
  if (!participant) return res.status(404).json({ error: 'User not found' });

  participant.status = status;
  participant.updatedAt = now();
  saveState();
  broadcast({ type: 'userStatusUpdated', participantId: userId, status });
  res.json({ success: true, user: participant });
});

app.post('/api/questions/:id/flag', adminLimiter, authenticate, authorizeRoles('candidate', 'admin'), (req, res) => {
  const q = questions.find((x) => x.id === Number(req.params.id));
  if (!q) return res.status(404).json({ error: 'Question not found' });

  q.status = q.status === 'flagged' ? 'pending' : 'flagged';
  saveState();
  broadcast({ type: 'questionStatusUpdated', questionId: q.id, status: q.status });
  res.json({ success: true, question: q });
});

app.post('/api/contribute', questionLimiter, (req, res) => {
  contributionCount += 1;
  safeWriteJSON(CONTRIB_FILE, { count: contributionCount, updatedAt: now() });
  broadcast({ type: 'contributionUpdate', count: contributionCount });
  res.json({ success: true, count: contributionCount });
});

app.get('/api/contributions', (req, res) => {
  res.json({ count: contributionCount });
});

app.post('/api/forms/volunteer', formsLimiter, async (req, res) => {
  const payload = {
    name: escText(req.body.name, 80),
    phone: escText(req.body.phone, 40),
    email: escText(req.body.email, 120),
    area: escText(req.body.area, 120)
  };

  if (!payload.name || !payload.phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const text = [
    'New volunteer signup received.',
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email || 'Not provided'}`,
    `Area: ${payload.area || 'Not provided'}`,
    `Submitted: ${now()}`
  ].join('\n');

  let delivered = false;
  try {
    delivered = await sendFormEmail({
      to: VOLUNTEER_RECIPIENTS.join(','),
      subject: 'New Volunteer Signup - Vote4Maureen',
      text,
      html: `<p>New volunteer signup received.</p><ul><li><strong>Name:</strong> ${payload.name}</li><li><strong>Phone:</strong> ${payload.phone}</li><li><strong>Email:</strong> ${payload.email || 'Not provided'}</li><li><strong>Area:</strong> ${payload.area || 'Not provided'}</li><li><strong>Submitted:</strong> ${now()}</li></ul>`
    });
  } catch (e) {
    delivered = false;
  }

  appendFormSubmission('volunteer', payload, delivered);
  res.json({ success: true, emailDelivered: delivered });
});

app.post('/api/forms/partner', formsLimiter, async (req, res) => {
  const payload = {
    organization: escText(req.body.organization, 120),
    contactName: escText(req.body.contactName, 80),
    email: escText(req.body.email, 120),
    phone: escText(req.body.phone, 40),
    message: escText(req.body.message, 2000)
  };

  if (!payload.organization || !payload.contactName || !payload.email || !payload.message) {
    return res.status(400).json({ error: 'Organization, contact, email, and message are required.' });
  }

  const text = [
    'New partnership inquiry received.',
    `Organization: ${payload.organization}`,
    `Contact: ${payload.contactName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || 'Not provided'}`,
    `Message: ${payload.message}`,
    `Submitted: ${now()}`
  ].join('\n');

  let delivered = false;
  try {
    delivered = await sendFormEmail({
      to: PARTNER_RECIPIENTS.join(','),
      subject: 'New Partner Inquiry - Vote4Maureen',
      text,
      html: `<p>New partnership inquiry received.</p><ul><li><strong>Organization:</strong> ${payload.organization}</li><li><strong>Contact:</strong> ${payload.contactName}</li><li><strong>Email:</strong> ${payload.email}</li><li><strong>Phone:</strong> ${payload.phone || 'Not provided'}</li><li><strong>Message:</strong> ${payload.message}</li><li><strong>Submitted:</strong> ${now()}</li></ul>`
    });
  } catch (e) {
    delivered = false;
  }

  appendFormSubmission('partner', payload, delivered);
  res.json({ success: true, emailDelivered: delivered });
});

app.get('*', (req, res) => {
  const filePath = path.join(SITE_ROOT, req.path);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.sendFile(path.join(SITE_ROOT, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Campaign Q&A server running on port', PORT);
  console.log('Health endpoint:', `http://localhost:${PORT}/health`);
});

function shutdown() {
  saveState();
  clients.forEach((c) => c.close());
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
