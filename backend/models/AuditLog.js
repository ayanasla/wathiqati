const { DataTypes } = require('sequelize');

/**
 * AuditLog Model
 * Tracks all significant actions performed on requests and system entities
 * Purpose: Maintain a complete audit trail for compliance and debugging
 */
module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique audit log entry identifier',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who performed the action',
    },
    action: {
      type: DataTypes.ENUM(
        'REQUEST_CREATED',
        'REQUEST_UPDATED',
        'REQUEST_APPROVED',
        'REQUEST_REJECTED',
        'REQUEST_IN_REVIEW',
        'DOCUMENT_GENERATED',
        'DOCUMENT_UPLOADED',
        'FILE_DOWNLOADED',
        'STATUS_CHANGED',
        'NOTES_ADDED',
        'REQUEST_DELETED',
        'ADMIN_ACTION'
      ),
      allowNull: false,
      comment: 'Type of action performed',
    },
    entityType: {
      type: DataTypes.ENUM('request', 'document', 'user', 'system'),
      allowNull: false,
      comment: 'Type of entity affected',
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the affected entity',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Human-readable description of the action',
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Delta of changes made (old value → new value)',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional context (IP address, user agent, etc.)',
    },
    severity: {
      type: DataTypes.ENUM('info', 'warning', 'critical'),
      defaultValue: 'info',
      comment: 'Severity level of the action',
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'partial'),
      defaultValue: 'success',
      comment: 'Status of the action',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if action failed',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'audit_logs',
    indexes: [
      { fields: ['userId'] },
      { fields: ['entityType', 'entityId'] },
      { fields: ['action'] },
      { fields: ['createdAt'] },
      { fields: ['userId', 'createdAt'] },
    ],
  });

  return AuditLog;
};
