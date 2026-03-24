// WebSocket Server for Campaign Q&A
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Create Express app for serving static files (optional)
const app = express();
app.use(cors());
app.use(express.json());

// Add a simple root route to show the server is running
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Maureen Ndungu Campaign Q&A Server',
        endpoints: {
            questions: '/api/questions',
            websocket: 'ws://' + req.get('host'),
            admin: '/admin.html'
        },
        timestamp: new Date().toISOString()
    });
});

// Serve admin.html if it exists
app.get('/admin.html', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info, cb) => {
        // Allow all connections (CORS)
        cb(true);
    }
});

// Store connected clients and questions
const clients = new Set();
let questions = [];
let nextQuestionId = 1;

// Campaign Q&A Data
const campaignInfo = {
    candidate: "Maureen Ndungu",
    ward: "Karen Ward",
    constituency: "Langata",
    platform: "Building a brighter future for Karen Ward"
};

// Helper function to moderate questions
function moderateQuestion(question, name) {
    if (question.length < 5) {
        return { approved: false, reason: "Question is too short. Please provide more details." };
    }
    
    if (question.length > 500) {
        return { approved: false, reason: "Question is too long. Please be more concise." };
    }
    
    // Add your moderation rules here
    const bannedWords = ['spam', 'offensive'];
    const lowerQuestion = question.toLowerCase();
    for (const bannedWord of bannedWords) {
        if (lowerQuestion.includes(bannedWord)) {
            return { approved: false, reason: "Your question contains inappropriate language." };
        }
    }
    
    return { approved: true };
}

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

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log(`New client connected. Total clients: ${clients.size + 1}`);
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Welcome to Maureen\'s Campaign Q&A! Ask your questions about Karen Ward.',
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
    const sanitizedQuestion = question.trim().substring(0, 500);
    
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
        message: 'Your question has been submitted! Maureen will review and respond soon.'
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
    📡 WebSocket server: wss://maureen-campaign-qa.onrender.com
    🌐 API: https://maureen-campaign-qa.onrender.com/api/questions
    📊 Admin: https://maureen-campaign-qa.onrender.com/admin.html
    👥 Server running on port ${PORT}
    `);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    
    broadcast({
        type: 'serverShutdown',
        message: 'The Q&A session is ending. Thank you for participating!'
    });
    
    clients.forEach(client => {
        client.close();
    });
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});