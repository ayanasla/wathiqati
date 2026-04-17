const { DataTypes } = require('sequelize');

/**
 * Notification Model
 * Represents notifications sent to users for various events
 * Relationship: Many Notifications belong to One User
 */
module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique notification identifier',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reference to User receiving the notification',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'Notification title',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'Notification message content',
    },
    type: {
      type: DataTypes.ENUM('request', 'task', 'document', 'system', 'approval', 'rejection'),
      defaultValue: 'system',
      allowNull: false,
      comment: 'Notification type',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      comment: 'Notification priority',
    },
    // Link to related entity
    relatedEntityType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of related entity (request, task, document, etc.)',
    },
    relatedEntityId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of related entity',
    },
    // Status
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether notification has been read',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When notification was read',
    },
    // Action
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to related resource/action',
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional notification data',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'notifications',
    indexes: [
      { fields: ['userId'] },
      { fields: ['isRead'] },
      { fields: ['type'] },
      { fields: ['createdAt'] },
      { fields: ['userId', 'isRead'] },
    ],
  });

  return Notification;
};
