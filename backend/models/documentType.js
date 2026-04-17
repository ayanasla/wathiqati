const { DataTypes } = require('sequelize');

/**
 * DocumentType Model
 * Represents different types of documents that can be requested
 * Examples: Birth Certificate, Marriage Certificate, Graduation Certificate, etc.
 */
module.exports = (sequelize) => {
  const DocumentType = sequelize.define('DocumentType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Document type identifier',
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
      comment: 'Document type name (e.g., Birth Certificate)',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Document type code (e.g., BC001)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Document type description',
    },
    processingTime: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Processing time in business days',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Document price if applicable',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Whether document type is available for requests',
    },
    requirementsFr: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Required documents (French)',
    },
    requirementsAr: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Required documents (Arabic)',
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
    tableName: 'documentTypes',
    indexes: [
      { fields: ['code'] },
      { fields: ['isActive'] },
    ],
  });

  return DocumentType;
};