const { DataTypes } = require('sequelize');

/**
 * Request Model
 * Represents a document request made by a Moroccan citizen
 * Relationship: Many Requests belong to One User
 */
module.exports = (sequelize) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique request identifier',
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
      comment: 'Reference to requesting User',
    },
    documentType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Type of document requested (e.g., birth certificate, ID card)',
    },
    requestNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Human-readable request number for tracking',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_review', 'approved', 'rejected', 'document_generated'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Current status of the request in the workflow',
    },
    trackingStatus: {
      type: DataTypes.ENUM('submitted', 'in_processing', 'under_validation', 'validated', 'ready_for_pickup', 'rejected'),
      defaultValue: 'submitted',
      allowNull: false,
      comment: 'Current tracking/location step of the request',
    },
    municipality: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Municipality where the request is submitted',
    },
    preparationLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Where the document will be prepared (e.g. municipality office)',
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Public URL or file path for generated/uploaded document',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional description or notes for the request',
    },
    // Personal Information Fields
    firstNameFr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'First name in French',
    },
    lastNameFr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Last name in French',
    },
    firstNameAr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'First name in Arabic',
    },
    lastNameAr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Last name in Arabic',
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of birth',
    },
    placeOfBirthFr: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Place of birth in French',
    },
    placeOfBirthAr: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Place of birth in Arabic',
    },
    nationalId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'National ID number',
    },
    addressFr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Address in French',
    },
    addressAr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Address in Arabic',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Phone number',
    },
    fatherNameFr: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Father name in French',
    },
    fatherNameAr: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Father name in Arabic',
    },
    motherNameFr: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Mother name in French',
    },
    motherNameAr: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Mother name in Arabic',
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Purpose of the document request',
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes added by admin while processing the request',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for rejection if status is rejected',
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the request was approved',
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the request was rejected',
    },
    pdfUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to generated PDF document when approved',
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
    tableName: 'requests',
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['municipality'] },
      { fields: ['createdAt'] },
    ],
  });

  return Request;
};