const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

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

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*');
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Database sync and server startup
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Sync database
    const force = process.env.DB_FORCE_SYNC === 'true';
    await sequelize.sync({ force });
    console.log('✓ Database synchronized');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Server startup error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
