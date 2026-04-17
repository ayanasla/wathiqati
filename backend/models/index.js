const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const User = require('./user')(sequelize);
const DocumentType = require('./documentType')(sequelize);
const Document = require('./Document')(sequelize);
const Request = require('./request')(sequelize);
const Task = require('./Task')(sequelize);
const Notification = require('./Notification')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// Define associations
// User associations
User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
User.hasMany(Document, { foreignKey: 'processedBy', as: 'processedDocuments' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// Request associations
Request.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Request.hasMany(Document, { foreignKey: 'requestId', as: 'documents' });
Request.hasMany(Task, { foreignKey: 'requestId', as: 'tasks' });
Request.hasMany(AuditLog, { foreignKey: 'entityId', as: 'auditLogs', scope: { entityType: 'request' } });

// Document associations
Document.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
Document.belongsTo(DocumentType, { foreignKey: 'documentTypeId', as: 'documentType' });
Document.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// DocumentType associations
DocumentType.hasMany(Document, { foreignKey: 'documentTypeId', as: 'documents' });

// Task associations
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  DocumentType,
  Document,
  Request,
  Task,
  Notification,
  AuditLog,
};
