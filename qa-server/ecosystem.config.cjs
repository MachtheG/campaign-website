module.exports = {
  apps: [
    {
      name: 'campaign-qa',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      out_file: '../logs/websocket.log',
      error_file: '../logs/websocket.log',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
