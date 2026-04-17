const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/unread/count', authenticate, getUnreadCount);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
