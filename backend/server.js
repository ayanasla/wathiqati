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

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*');
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.options('*', cors({ origin: allowedOrigin, credentials: true }));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/health', (req, res) => res.json({ status: 'OK' }));
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
    await sequelize.sync();
    console.log(' Database synced');
    app.listen(PORT, () => {
      console.log(` Server on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

start();
