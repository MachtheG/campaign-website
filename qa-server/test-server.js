const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

server.on('connection', (ws) => {
    console.log('Client connected');
    ws.send('Connection successful!');
});

console.log('Test server running on ws://localhost:3000');
