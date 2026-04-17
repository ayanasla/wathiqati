const DocumentService = require('../services/documentService');
const { validateDocumentInput } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

const requestDocument = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const validation = validateDocumentInput(title);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const document = await DocumentService.requestDocument(
      { title, description },
      req.user.id
    );

    logger.info('Document requested', { documentId: document.id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Document request submitted successfully',
      document,
    });
  } catch (error) {
    logger.error('Request document error', error);
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await DocumentService.getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    logger.error('Get document error', error);
    next(error);
  }
};

const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await DocumentService.getMyDocuments(req.user.id);

    res.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    logger.error('Get my documents error', error);
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const documents = await DocumentService.getAllDocuments({ status });

    res.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    logger.error('Get all documents error', error);
    next(error);
  }
};

const updateDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !['pending', 'processing', 'ready', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const document = await DocumentService.updateDocumentStatus(
      id,
      status,
      req.user.id,
      rejectionReason
    );

    logger.info('Document status updated', { documentId: id, status, updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Document status updated successfully',
      document,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Update document status error', error);
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const document = await DocumentService.uploadDocumentFile(
      id,
      req.file,
      req.user.id
    );

    logger.info('Document file uploaded', { documentId: id, uploadedBy: req.user.id });

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Upload document error', error);
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filePath, fileName } = await DocumentService.getDocumentFile(id);

    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error('Download error', err);
        res.status(500).json({
          success: false,
          message: 'Download failed',
        });
      }
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Download document error', error);
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    await DocumentService.deleteDocument(id);

    logger.info('Document deleted', { documentId: id, deletedBy: req.user.id });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Delete document error', error);
    next(error);
  }
};

module.exports = {
  requestDocument,
  getDocument,
  getMyDocuments,
  getAllDocuments,
  updateDocumentStatus,
  uploadDocument,
  downloadDocument,
  deleteDocument,
};