// Configuration for Maureen's Campaign Website
const config = {
    // Production - Your Render server
    WS_URL: 'wss://maureen-campaign-qa.onrender.com',
    API_URL: 'https://maureen-campaign-qa.onrender.com/api'
};

// For local development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    config.WS_URL = 'ws://localhost:3001';
    config.API_URL = 'http://localhost:3001/api';
}

 export default config;