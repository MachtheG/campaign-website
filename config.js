// Production Configuration
const config = {
    // This will be updated after you deploy to Render
    WS_URL: 'wss://maureen-campaign-qa.onrender.com',
    API_URL: 'https://maureen-campaign-qa.onrender.com/api'
};

// For local development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    config.WS_URL = 'ws://localhost:3001';
    config.API_URL = 'http://localhost:3001/api';
}

export default config;
