// WebSocket Server for Campaign Q&A with Persistent Storage
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// File to store questions persistently
const DATA_FILE = path.join(__dirname, 'questions.json');

// Load saved questions from file
let questions = [];
let nextQuestionId = 1;

function loadQuestions() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const saved = JSON.parse(data);
            questions = saved.questions || [];
            nextQuestionId = saved.nextQuestionId || 1;
            console.log(`✅ Loaded ${questions.length} saved questions from file`);
        } else {
            console.log('📝 No existing questions file. Starting fresh.');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        questions = [];
    }
}

function saveQuestions() {
    try {
        const data = {
            questions: questions,
            nextQuestionId: nextQuestionId,
            lastSaved: new Date().toISOString()
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log(`💾 Saved ${questions.length} questions to file`);
    } catch (error) {
        console.error('Error saving questions:', error);
    }
}

// Load existing questions on startup
loadQuestions();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info, cb) => {
        cb(true);
    }
});

// Store connected clients
const clients = new Set();

const campaignInfo = {
    candidate: "Maureen Ndungu",
    ward: "Karen Ward",
    constituency: "Langata"
};

// Broadcast message to all connected clients
function broadcast(data, excludeClient = null) {
    const message = JSON.stringify(data);
    
    clients.forEach(client => {
        if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Send current questions to a new client
function sendQuestionHistory(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
            type: 'history',
            questions: questions.slice(-100) // Send last 100 questions
        }));
    }
}

// Helper function to moderate questions
function moderateQuestion(questionText, userName) {
    if (!questionText || questionText.trim().length < 3) {
        return { approved: false, reason: "Question is too short. Please provide more details." };
    }
    
    if (questionText.length > 2000) {
        return { approved: false, reason: "Question is too long. Please be more concise (max 2000 characters)." };
    }
    
    // Check for banned words
    const bannedWords = ['spam', 'offensive', 'inappropriate', 'hate', 'scam'];
    const lowerQuestion = questionText.toLowerCase();
    for (const bannedWord of bannedWords) {
        if (lowerQuestion.includes(bannedWord)) {
            return { approved: false, reason: "Your question contains inappropriate language." };
        }
    }
    
    return { approved: true };
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log(`New client connected. Total clients: ${clients.size + 1}`);
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Welcome to Maureen\'s Campaign Q&A! Questions are saved and visible to everyone.',
        campaignInfo: campaignInfo,
        activeUsers: clients.size
    }));
    
    // Send question history to new client
    sendQuestionHistory(ws);
    
    // Broadcast updated user count
    broadcast({
        type: 'userCount',
        count: clients.size
    });
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data.type);
            
            switch(data.type) {
                case 'question':
                    handleNewQuestion(ws, data);
                    break;
                case 'vote':
                    handleVote(ws, data);
                    break;
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type'
                    }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        broadcast({
            type: 'userCount',
            count: clients.size
        });
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Handle new question submission
function handleNewQuestion(client, data) {
    const { name, question } = data;
    
    if (!question || question.trim() === '') {
        client.send(JSON.stringify({
            type: 'error',
            message: 'Please enter a question'
        }));
        return;
    }
    
    const sanitizedName = name ? name.trim().substring(0, 50) : 'Karen Resident';
    const sanitizedQuestion = question.trim().substring(0, 2000);
    
    const moderation = moderateQuestion(sanitizedQuestion, sanitizedName);
    
    if (!moderation.approved) {
        client.send(JSON.stringify({
            type: 'error',
            message: moderation.reason
        }));
        return;
    }
    
    const questionObj = {
        id: nextQuestionId++,
        name: sanitizedName,
        question: sanitizedQuestion,
        timestamp: new Date().toISOString(),
        votes: 0,
        answered: false,
        answer: null,
        answerTimestamp: null
    };
    
    questions.unshift(questionObj);
    
    // Keep last 500 questions (plenty for a campaign)
    if (questions.length > 500) {
        questions = questions.slice(0, 500);
    }
    
    // Save to file immediately
    saveQuestions();
    
    broadcast({
        type: 'newQuestion',
        question: questionObj
    });
    
    client.send(JSON.stringify({
        type: 'questionSubmitted',
        id: questionObj.id,
        message: 'Your question has been submitted and saved!'
    }));
    
    console.log(`New question #${questionObj.id} from ${sanitizedName}`);
}

function handleVote(client, data) {
    const { questionId, voteType } = data;
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
        if (voteType === 'up') {
            question.votes++;
        } else if (voteType === 'down') {
            question.votes--;
        }
        
        // Save votes to file
        saveQuestions();
        
        broadcast({
            type: 'voteUpdate',
            questionId: questionId,
            votes: question.votes
        });
    }
}

// API endpoint to get all questions
app.get('/api/questions', (req, res) => {
    res.json({
        total: questions.length,
        questions: questions
    });
});

// API endpoint to get a specific question
app.get('/api/questions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const question = questions.find(q => q.id === id);
    
    if (question) {
        res.json(question);
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

// API endpoint to answer a question
app.post('/api/questions/:id/answer', express.json(), (req, res) => {
    const id = parseInt(req.params.id);
    const { answer } = req.body;
    const question = questions.find(q => q.id === id);
    
    if (question && answer) {
        question.answered = true;
        question.answer = answer;
        question.answerTimestamp = new Date().toISOString();
        
        // Save to file
        saveQuestions();
        
        broadcast({
            type: 'questionAnswered',
            questionId: id,
            answer: answer,
            answeredAt: question.answerTimestamp,
            name: question.name,
            question: question.question
        });
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

// API endpoint to delete question
app.delete('/api/questions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = questions.findIndex(q => q.id === id);
    
    if (index !== -1) {
        questions.splice(index, 1);
        saveQuestions();
        
        broadcast({
            type: 'questionDeleted',
            questionId: id
        });
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

// API endpoint to get statistics
app.get('/api/stats', (req, res) => {
    const answered = questions.filter(q => q.answered).length;
    const pending = questions.filter(q => !q.answered).length;
    
    res.json({
        total: questions.length,
        answered: answered,
        pending: pending,
        lastUpdated: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Maureen's Campaign Q&A Server</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: linear-gradient(135deg, #2c3e50 0%, #e67e22 100%); color: white; }
                .card { background: rgba(255,255,255,0.95); color: #333; padding: 20px; border-radius: 10px; margin-top: 20px; }
                h1 { color: #e67e22; }
                a { color: #e67e22; }
                .stats { display: flex; gap: 20px; margin: 20px 0; }
                .stat { background: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; flex: 1; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🗳️ Maureen Ndungu Campaign Q&A Server</h1>
                <p>✅ Server is running with persistent storage!</p>
                <div class="stats" id="stats">Loading stats...</div>
                <p>📊 <a href="/api/questions">View All Questions (API)</a></p>
                <p>🔧 <a href="/admin.html">Admin Panel</a></p>
                <p>💬 Questions are saved to <code>questions.json</code> and persist across server restarts.</p>
            </div>
            <script>
                fetch('/api/stats')
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('stats').innerHTML = \`
                            <div class="stat">📝 Total: \${data.total}</div>
                            <div class="stat">✅ Answered: \${data.answered}</div>
                            <div class="stat">⏳ Pending: \${data.pending}</div>
                        \`;
                    });
            </script>
        </body>
        </html>
    `);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Maureen Ndungu Campaign Q&A Server Started!
    🌐 URL: http://localhost:${PORT}
    📡 WebSocket: ws://localhost:${PORT}
    📊 API: http://localhost:${PORT}/api/questions
    🔧 Admin: http://localhost:${PORT}/admin.html
    💾 Questions are saved to: ${DATA_FILE}
    👥 Server running on port ${PORT}
    `);
});

process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    saveQuestions(); // Final save before shutdown
    broadcast({ type: 'serverShutdown', message: 'Server is shutting down' });
    clients.forEach(client => client.close());
    server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, saving data...');
    saveQuestions();
    process.exit(0);
});