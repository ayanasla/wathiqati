const path = require('path');
// Load environment variables - safe for production
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch (error) {
  // In production (Railway), env vars are provided directly
  console.log('Using environment variables from Railway');
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notificationRoutes');
const requestRoutes = require('./routes/requests');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');

const { errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const app = express();

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*');
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.options('*', cors({ origin: allowedOrigin, credentials: true }));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);

// Error handling
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5001;

async function start() {
  try {
    const forceSync = process.env.DB_FORCE_SYNC === 'true';
    await sequelize.sync({ force: forceSync });
    console.log(`✓ Database synced${forceSync ? ' (forced)' : ''}`);

    // Listen on 0.0.0.0 for Railway deployment
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('✗ Server startup error:', err.message);
    process.exit(1);
  }
}

start();
