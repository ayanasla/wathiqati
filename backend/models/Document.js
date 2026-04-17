const { DataTypes } = require('sequelize');

/**
 * Document Model
 * Represents generated/processed documents in the system
 * Relationship: Many Documents belong to One Request, One DocumentType
 */
module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique document identifier',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'Document title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Document description',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'ready', 'rejected', 'expired'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Document processing status',
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path to stored document file',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Original document file name',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes',
    },
    mimeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'MIME type of the document (e.g., application/pdf)',
    },
    // Foreign Keys
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'requests',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reference to Request',
    },
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documentTypes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Reference to DocumentType',
    },
    processedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to employee who processed the document',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for rejection if status is rejected',
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Document expiry date if applicable',
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
    tableName: 'documents',
    indexes: [
      { fields: ['requestId'] },
      { fields: ['documentTypeId'] },
      { fields: ['status'] },
      { fields: ['processedByUserId'] },
    ],
  });

  return Document;
};
