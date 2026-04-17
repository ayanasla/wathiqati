const { DataTypes } = require('sequelize');

/**
 * Task Model
 * Represents tasks assigned to process requests
 * Relationship: Many Tasks belong to One Request
 *             Many Tasks belong to One User (creator)
 *             Many Tasks are assigned to One User (assignee)
 */
module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique task identifier',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'Task title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed task description',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Task status',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: false,
      comment: 'Task priority level',
    },
    // Foreign keys
    requestId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'requests',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to Request (if task is related to a request)',
    },
    createdByUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Reference to user who created the task',
    },
    assignedUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to user assigned to the task',
    },
    // Dates
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Task deadline',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When task was started',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When task was completed',
    },
    // Additional information
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Task due date',
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Estimated hours to complete',
    },
    actualHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Actual hours spent',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Task notes and comments',
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
    tableName: 'tasks',
    indexes: [
      { fields: ['requestId'] },
      { fields: ['createdByUserId'] },
      { fields: ['assignedUserId'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['deadline'] },
    ],
  });

  return Task;
};
