const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = await NotificationService.getUserNotifications(
      req.user.id,
      unreadOnly === 'true'
    );

    res.json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    logger.error('Get notifications error', error);
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    logger.error('Get unread count error', error);
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(id);

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Mark as read error', error);
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Mark all as read error', error);
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await NotificationService.deleteNotification(id);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Delete notification error', error);
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
