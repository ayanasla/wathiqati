module.exports = {
  apps: [{
    name: 'wathiqati-api',
    script: './backend/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_restarts: 5,
    min_uptime: '10s',
    autorestart: true,
    max_memory_restart: '300M',
  }],
};