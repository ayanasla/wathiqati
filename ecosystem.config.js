module.exports = {
  apps: [{
    name: 'wathiqati-api',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_restarts: 10,
    min_uptime: '10s',
    autorestart: true,
    max_memory_restart: '500M',
  }],
};