module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  nodeEnv: process.env.NODE_ENV || 'development',
};
