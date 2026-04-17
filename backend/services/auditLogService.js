const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * AuditLogService
 * Centralized service for recording and retrieving audit logs
 * Ensures consistent audit trail across the application
 */
class AuditLogService {
  /**
   * Log an action to the audit trail
   * @param {Object} auditData - Audit data
   * @param {string} auditData.action - Type of action (REQUEST_APPROVED, etc.)
   * @param {string} auditData.entityType - Type of entity ('request', 'document', etc.)
   * @param {string} auditData.entityId - ID of affected entity
   * @param {string} auditData.userId - ID of user performing action
   * @param {string} auditData.description - Human-readable description
   * @param {Object} auditData.changes - Changes made (before → after)
   * @param {Object} auditData.metadata - Additional context
   * @param {string} auditData.severity - 'info', 'warning', 'critical'
   * @param {string} auditData.status - 'success', 'failure', 'partial'
   * @param {string} auditData.errorMessage - Error message if failed
   */
  static async log(auditData) {
    try {
      const logEntry = await AuditLog.create({
        userId: auditData.userId || null,
        action: auditData.action,
        entityType: auditData.entityType,
        entityId: auditData.entityId,
        description: auditData.description || this.generateDescription(auditData),
        changes: auditData.changes || null,
        metadata: auditData.metadata || null,
        severity: auditData.severity || 'info',
        status: auditData.status || 'success',
        errorMessage: auditData.errorMessage || null,
      });

      logger.info(`[AUDIT] ${auditData.action} on ${auditData.entityType}:${auditData.entityId}`, {
        userId: auditData.userId,
        changes: auditData.changes,
      });

      return logEntry;
    } catch (error) {
      logger.error('Error creating audit log entry', error);
      // Don't throw - audit logging should not break the main operation
      return null;
    }
  }

  /**
   * Get audit logs for an entity
   */
  static async getEntityLogs(entityType, entityId, limit = 50) {
    try {
      const logs = await AuditLog.findAll({
        where: { entityType, entityId },
        order: [['createdAt', 'DESC']],
        limit,
      });
      return logs;
    } catch (error) {
      logger.error('Error retrieving entity logs', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a user's actions
   */
  static async getUserActions(userId, limit = 50, offset = 0) {
    try {
      const logs = await AuditLog.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
      return logs;
    } catch (error) {
      logger.error('Error retrieving user actions', error);
      throw error;
    }
  }

  /**
   * Get logs for a specific action type
   */
  static async getActionLogs(action, limit = 50) {
    try {
      const logs = await AuditLog.findAll({
        where: { action },
        order: [['createdAt', 'DESC']],
        limit,
      });
      return logs;
    } catch (error) {
      logger.error('Error retrieving action logs', error);
      throw error;
    }
  }

  /**
   * Get audit logs in a date range
   */
  static async getLogsByDateRange(startDate, endDate, filters = {}) {
    try {
      const where = {
        createdAt: {
          [require('sequelize').Op.between]: [startDate, endDate],
        },
      };

      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.entityType) where.entityType = filters.entityType;

      const logs = await AuditLog.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      return logs;
    } catch (error) {
      logger.error('Error retrieving logs by date range', error);
      throw error;
    }
  }

  /**
   * Generate a human-readable description based on action
   */
  static generateDescription(auditData) {
    const actionDescriptions = {
      REQUEST_CREATED: 'Request was created',
      REQUEST_UPDATED: 'Request was updated',
      REQUEST_APPROVED: 'Request was approved',
      REQUEST_REJECTED: 'Request was rejected',
      REQUEST_IN_REVIEW: 'Request moved to in-review status',
      DOCUMENT_GENERATED: 'Document was generated',
      DOCUMENT_UPLOADED: 'Document was uploaded',
      FILE_DOWNLOADED: 'File was downloaded',
      STATUS_CHANGED: 'Request status was changed',
      NOTES_ADDED: 'Admin notes were added',
      REQUEST_DELETED: 'Request was deleted',
      ADMIN_ACTION: 'Admin action performed',
    };

    return actionDescriptions[auditData.action] || 'Action performed';
  }

  /**
   * Delete old audit logs (retention policy)
   * @param {number} daysToKeep - Number of days to retain logs
   */
  static async deleteOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AuditLog.destroy({
        where: {
          createdAt: {
            [require('sequelize').Op.lt]: cutoffDate,
          },
        },
      });

      logger.info(`Deleted ${result} old audit logs`);
      return result;
    } catch (error) {
      logger.error('Error deleting old audit logs', error);
      throw error;
    }
  }
}

module.exports = AuditLogService;
