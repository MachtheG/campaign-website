// WebSocket Server for Campaign Q&A
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Create Express app for serving static files (optional)
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients and questions
const clients = new Set();
let questions = []; // Store all questions with metadata
let nextQuestionId = 1;

// Question moderation settings
const MODERATION = {
    enabled: true, // Set to false for auto-posting
    bannedWords: ['spam', 'offensive', 'inappropriate'],
    maxQuestionLength: 500,
    minQuestionLength: 5
};

// Campaign Q&A Data
const campaignInfo = {
    candidate: "Your Candidate Name",
    platform: "Building a brighter future for all families",
    socialMedia: "@CandidateForProgress",
    website: "www.candidate2026.com"
};

// Helper function to moderate questions
function moderateQuestion(question, name) {
    // Check length
    if (question.length < MODERATION.minQuestionLength) {
        return { approved: false, reason: "Question is too short. Please provide more details." };
    }
    
    if (question.length > MODERATION.maxQuestionLength) {
        return { approved: false, reason: "Question is too long. Please be more concise." };
    }
    
    // Check for banned words
    const lowerQuestion = question.toLowerCase();
    for (const bannedWord of MODERATION.bannedWords) {
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
            questions: questions.slice(-50) // Send last 50 questions
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
        message: 'Welcome to the Campaign Q&A! Ask your questions and engage with the community.',
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
            console.log('Received:', data);
            
            switch(data.type) {
                case 'question':
                    handleNewQuestion(ws, data);
                    break;
                    
                case 'vote':
                    handleVote(ws, data);
                    break;
                    
                case 'like':
                    handleLike(ws, data);
                    break;
                    
                case 'report':
                    handleReport(ws, data);
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
        
        // Broadcast updated user count
        broadcast({
            type: 'userCount',
            count: clients.size
        });
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Handle new question submission
function handleNewQuestion(client, data) {
    const { name, question } = data;
    
    // Validate input
    if (!question || question.trim() === '') {
        client.send(JSON.stringify({
            type: 'error',
            message: 'Please enter a question'
        }));
        return;
    }
    
    // Sanitize inputs
    const sanitizedName = name ? name.trim().substring(0, 50) : 'Anonymous Supporter';
    const sanitizedQuestion = question.trim().substring(0, MODERATION.maxQuestionLength);
    
    // Moderate the question
    const moderation = moderateQuestion(sanitizedQuestion, sanitizedName);
    
    if (!moderation.approved) {
        client.send(JSON.stringify({
            type: 'error',
            message: moderation.reason
        }));
        return;
    }
    
    // Create question object
    const questionObj = {
        id: nextQuestionId++,
        name: sanitizedName,
        question: sanitizedQuestion,
        timestamp: new Date().toISOString(),
        votes: 0,
        liked: false,
        reported: false,
        answered: false,
        answer: null
    };
    
    // Add to questions array
    questions.unshift(questionObj);
    
    // Keep only last 200 questions
    if (questions.length > 200) {
        questions = questions.slice(0, 200);
    }
    
    // Broadcast to all clients
    broadcast({
        type: 'newQuestion',
        question: questionObj
    });
    
    // Send confirmation to the sender
    client.send(JSON.stringify({
        type: 'questionSubmitted',
        id: questionObj.id,
        message: 'Your question has been submitted and is now live!'
    }));
    
    console.log(`New question from ${sanitizedName}: ${sanitizedQuestion.substring(0, 50)}...`);
}

// Handle voting on questions
function handleVote(client, data) {
    const { questionId, voteType } = data;
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
        if (voteType === 'up') {
            question.votes++;
        } else if (voteType === 'down') {
            question.votes--;
        }
        
        // Broadcast vote update
        broadcast({
            type: 'voteUpdate',
            questionId: questionId,
            votes: question.votes
        });
    }
}

// Handle likes
function handleLike(client, data) {
    const { questionId } = data;
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
        question.liked = !question.liked;
        
        broadcast({
            type: 'likeUpdate',
            questionId: questionId,
            liked: question.liked
        });
    }
}

// Handle report (for moderation)
function handleReport(client, data) {
    const { questionId, reason } = data;
    const question = questions.find(q => q.id === questionId);
    
    if (question && !question.reported) {
        question.reported = true;
        
        // In a real campaign, this would notify moderators
        console.log(`Question ${questionId} reported: ${reason}`);
        
        client.send(JSON.stringify({
            type: 'reportReceived',
            message: 'Thank you for reporting. Our team will review this question.'
        }));
    }
}

// API endpoint to get questions (for admin/moderators)
app.get('/api/questions', (req, res) => {
    res.json({
        total: questions.length,
        questions: questions.slice(0, 100)
    });
});

// API endpoint to delete question (moderation)
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

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`
    🚀 Campaign Q&A Server Started!
    📡 WebSocket server running on ws://localhost:${PORT}
    🌐 HTTP API available on http://localhost:${PORT}/api/questions
    👥 Ready to accept connections
    `);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    
    // Notify all clients
    broadcast({
        type: 'serverShutdown',
        message: 'The Q&A session is ending. Thank you for participating!'
    });
    
    // Close all connections
    clients.forEach(client => {
        client.close();
    });
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});