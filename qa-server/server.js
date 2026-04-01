// WebSocket Server for Campaign Q&A
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Root route - serve a simple HTML page
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
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🗳️ Maureen Ndungu Campaign Q&A Server</h1>
                <p>✅ Server is running!</p>
                <p>📊 API: <a href="/api/questions">/api/questions</a></p>
                <p>🔧 Admin: <a href="/admin.html">/admin.html</a></p>
            </div>
        </body>
        </html>
    `);
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info, cb) => {
        cb(true);
    }
});

// Store connected clients and questions
const clients = new Set();
let questions = [];
let nextQuestionId = 1;

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
            questions: questions.slice(-50)
        }));
    }
}

// Helper function to moderate questions
function moderateQuestion(questionText, userName) {
    if (!questionText || questionText.trim().length < 5) {
        return { approved: false, reason: "Question is too short. Please provide more details." };
    }
    
    if (questionText.length > 2000) {
        return { approved: false, reason: "Question is too long. Please be more concise (max 2000 characters)." };
    }
    
    // Check for banned words
    const bannedWords = ['spam', 'offensive', 'inappropriate', 'hate'];
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
        message: 'Welcome to Maureen\'s Campaign Q&A!',
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
        answer: null
    };
    
    questions.unshift(questionObj);
    
    if (questions.length > 200) {
        questions = questions.slice(0, 200);
    }
    
    broadcast({
        type: 'newQuestion',
        question: questionObj
    });
    
    client.send(JSON.stringify({
        type: 'questionSubmitted',
        id: questionObj.id,
        message: 'Your question has been submitted!'
    }));
    
    console.log(`New question from ${sanitizedName}: ${sanitizedQuestion.substring(0, 50)}...`);
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
        
        broadcast({
            type: 'voteUpdate',
            questionId: questionId,
            votes: question.votes
        });
    }
}

// API endpoint to get questions
app.get('/api/questions', (req, res) => {
    res.json({
        total: questions.length,
        questions: questions.slice(0, 100)
    });
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
        
        broadcast({
            type: 'questionAnswered',
            questionId: id,
            answer: answer,
            answeredAt: question.answerTimestamp
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
        broadcast({
            type: 'questionDeleted',
            questionId: id
        });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
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
    👥 Server running on port ${PORT}
    `);
});

process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    broadcast({ type: 'serverShutdown', message: 'Server is shutting down' });
    clients.forEach(client => client.close());
    server.close(() => process.exit(0));
});
