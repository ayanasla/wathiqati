const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message, data = {}) => {
    const log = `[${getTimestamp()}] INFO: ${message} ${JSON.stringify(data)}`;
    console.log(log);
  },

  error: (message, error = {}) => {
    const log = `[${getTimestamp()}] ERROR: ${message} ${error.message || JSON.stringify(error)}`;
    console.error(log);
  },

  warn: (message, data = {}) => {
    const log = `[${getTimestamp()}] WARN: ${message} ${JSON.stringify(data)}`;
    console.warn(log);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const log = `[${getTimestamp()}] DEBUG: ${message} ${JSON.stringify(data)}`;
      console.log(log);
    }
  },
};

module.exports = logger;
