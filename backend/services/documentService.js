const { Document, User, Notification } = require('../models');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class DocumentService {
  static async requestDocument(documentData, userId) {
    try {
      const document = await Document.create({
        ...documentData,
        userId,
        status: 'pending',
      });

      await Notification.create({
        userId: userId,
        title: 'Document Request Submitted',
        message: `Your document request for "${document.title}" has been submitted for processing.`,
        type: 'document',
        relatedId: document.id,
      });

      return document;
    } catch (error) {
      logger.error('Error requesting document', error);
      throw error;
    }
  }

  static async getDocumentById(documentId) {
    try {
      const document = await Document.findByPk(documentId, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'processor', attributes: ['id', 'name', 'email'] },
        ],
      });
      return document;
    } catch (error) {
      logger.error('Error getting document', error);
      throw error;
    }
  }

  static async getMyDocuments(userId) {
    try {
      const documents = await Document.findAll({
        where: { userId },
        include: [
          { model: User, as: 'processor', attributes: ['id', 'name', 'email'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      return documents;
    } catch (error) {
      logger.error('Error getting user documents', error);
      throw error;
    }
  }

  static async getAllDocuments(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      const documents = await Document.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'processor', attributes: ['id', 'name', 'email'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      return documents;
    } catch (error) {
      logger.error('Error getting documents', error);
      throw error;
    }
  }

  static async updateDocumentStatus(documentId, status, userId, rejectionReason = null) {
    try {
      const document = await Document.findByPk(documentId);
      if (!document) {
        throw { statusCode: 404, message: 'Document not found' };
      }

      document.status = status;
      document.processedByUserId = userId;

      if (status === 'rejected' && rejectionReason) {
        document.rejectionReason = rejectionReason;
      }

      await document.save();

      const statusMessages = {
        processing: 'Your document is being processed.',
        ready: 'Your document is ready for download!',
        rejected: `Your document request was rejected. Reason: ${rejectionReason}`,
      };

      if (statusMessages[status]) {
        await Notification.create({
          userId: document.userId,
          title: `Document Status: ${status.toUpperCase()}`,
          message: statusMessages[status],
          type: 'document',
          relatedId: document.id,
        });
      }

      return document;
    } catch (error) {
      logger.error('Error updating document status', error);
      throw error;
    }
  }

  static async uploadDocumentFile(documentId, file, userId) {
    try {
      const document = await Document.findByPk(documentId);
      if (!document) {
        throw { statusCode: 404, message: 'Document not found' };
      }

      document.filePath = file.path;
      document.fileName = file.filename;
      document.fileSize = file.size;
      document.mimeType = file.mimetype;
      document.status = 'ready';
      document.processedByUserId = userId;

      await document.save();

      await Notification.create({
        userId: document.userId,
        title: 'Document Ready',
        message: `Your document "${document.title}" is ready for download.`,
        type: 'document',
        relatedId: document.id,
      });

      return document;
    } catch (error) {
      logger.error('Error uploading document file', error);
      throw error;
    }
  }

  static async getDocumentFile(documentId) {
    try {
      const document = await Document.findByPk(documentId);
      if (!document || !document.filePath) {
        throw { statusCode: 404, message: 'Document file not found' };
      }

      const filePath = path.join(process.cwd(), document.filePath);
      if (!fs.existsSync(filePath)) {
        throw { statusCode: 404, message: 'File not found on server' };
      }

      return { filePath, fileName: document.fileName };
    } catch (error) {
      logger.error('Error getting document file', error);
      throw error;
    }
  }

  static async deleteDocument(documentId) {
    try {
      const document = await Document.findByPk(documentId);
      if (!document) {
        throw { statusCode: 404, message: 'Document not found' };
      }

      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      await document.destroy();
      return true;
    } catch (error) {
      logger.error('Error deleting document', error);
      throw error;
    }
  }
}

module.exports = DocumentService;
