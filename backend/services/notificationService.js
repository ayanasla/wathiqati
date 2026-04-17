const { Notification } = require('../models');
const logger = require('../utils/logger');

class NotificationService {
  static async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      return notification;
    } catch (error) {
      logger.error('Error creating notification', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, unreadOnly = false) {
    try {
      const where = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      return notifications;
    } catch (error) {
      logger.error('Error getting notifications', error);
      throw error;
    }
  }

  static async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw { statusCode: 404, message: 'Notification not found' };
      }

      notification.isRead = true;
      await notification.save();
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
      return true;
    } catch (error) {
      logger.error('Error marking all notifications as read', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw { statusCode: 404, message: 'Notification not found' };
      }

      await notification.destroy();
      return true;
    } catch (error) {
      logger.error('Error deleting notification', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: { userId, isRead: false },
      });
      return count;
    } catch (error) {
      logger.error('Error getting unread count', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
