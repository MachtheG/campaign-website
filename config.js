// Runtime configuration for API/WebSocket endpoints.
// Update PROD_API_URL and PROD_WS_URL before publishing if your backend host changes.
(function () {
    // Temporary production fallback while api subdomain DNS/custom-domain verification completes.
    var PROD_API_URL = 'https://maureen-campaign-qa.onrender.com/api';
    var PROD_WS_URL = 'wss://maureen-campaign-qa.onrender.com';

    var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    window.CAMPAIGN_CONFIG = {
        API_URL: isLocal ? 'http://localhost:3001/api' : PROD_API_URL,
        WS_URL: isLocal ? 'ws://localhost:3001' : PROD_WS_URL
    };
})();