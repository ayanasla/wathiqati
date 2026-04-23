const { Request, User } = require('../models');
const RequestService = require('../services/requestService');
const NotificationService = require('../services/notificationService');
const { generateRequestPDF } = require('../utils/pdfGenerator');
const { v4: uuidv4 } = require('uuid');

// Helper function to check if user is admin or employee
const isAdminOrEmployee = (user) => {
  return user.role === 'admin' || user.role === 'employee';
};

const generatePdfForRequest = async (request) => {
  const pdfBuffer = await generateRequestPDF(request);
  request.pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
  await request.save();
  return request;
};

const mapRequestPayload = (input = {}) => {
  const payload = { ...input };
  const mapping = {
    status: 'status',
    document_type: 'documentType',
    request_number: 'requestNumber',
    preparation_location: 'preparationLocation',
    place_of_birth_fr: 'placeOfBirthFr',
    place_of_birth_ar: 'placeOfBirthAr',
    date_of_birth: 'dateOfBirth',
    national_id: 'nationalId',
    first_name_fr: 'firstNameFr',
    last_name_fr: 'lastNameFr',
    first_name_ar: 'firstNameAr',
    last_name_ar: 'lastNameAr',
    address_fr: 'addressFr',
    address_ar: 'addressAr',
    father_name_fr: 'fatherNameFr',
    father_name_ar: 'fatherNameAr',
    mother_name_fr: 'motherNameFr',
    mother_name_ar: 'motherNameAr',
    notes: 'description',
    admin_notes: 'adminNotes',
    rejection_reason: 'rejectionReason',
    pdf_url: 'pdfUrl',
    document_url: 'documentUrl',
  };

  Object.entries(mapping).forEach(([snake, camel]) => {
    if (input[snake] !== undefined) {
      payload[camel] = input[snake];
    }
  });

  if (payload.status === 'ready') {
    payload.status = 'approved';
  }

  return payload;
};

const create = async (req, res) => {
  try {
    const rawPayload = mapRequestPayload(req.body);
    const payload = { ...rawPayload };

    // Validate required fields
    const requiredFields = ['documentType'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      console.log('Request validation failed: missing required fields', {
        missingFields,
        userId: req.user.id,
        body: req.body,
      });
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
        errors: missingFields.reduce((acc, field) => {
          const originalField = field === 'documentType' ? 'document_type' : field;
          acc[originalField] = `${originalField} is required`;
          return acc;
        }, {}),
      });
    }

    // Validate personal information for step 2 equivalent
    if (payload.firstNameFr && payload.lastNameFr && payload.firstNameAr && payload.lastNameAr) {
      if (!payload.dateOfBirth || !payload.nationalId) {
        console.log('Request validation failed: incomplete personal info', {
          hasDateOfBirth: !!payload.dateOfBirth,
          hasNationalId: !!payload.nationalId
        });
        return res.status(400).json({
          success: false,
          message: 'Personal information incomplete',
          errors: {
            dateOfBirth: !payload.dateOfBirth ? 'Date of birth is required' : null,
            nationalId: !payload.nationalId ? 'National ID is required' : null
          }
        });
      }
    }

    payload.requestNumber = payload.requestNumber || `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    payload.userId = req.user.id;
    payload.preparationLocation = payload.preparationLocation || 'Arrondissement Yaacoub El Mansour - Rabat';

    console.log('Creating request with payload:', {
      requestNumber: payload.requestNumber,
      documentType: payload.documentType,
      userId: payload.userId,
    });

    const request = await RequestService.createRequest(req.user.id, payload);

    console.log('Request created successfully', {
      requestId: request.id,
      requestNumber: request.requestNumber
    });

    res.status(201).json({
      success: true,
      data: request,
      request_number: request.requestNumber
    });
  } catch (error) {
    console.error('Request creation error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id
    });

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = {};
      error.errors.forEach(err => {
        validationErrors[err.path] = err.message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errors: { [field]: `${field} must be unique` }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const list = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const where = {};
    if (!isAdminOrEmployee(req.user)) {
      where.userId = req.user.id;
    }
    const { count, rows: requests } = await Request.findAndCountAll({ 
      where, 
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']] 
    });
    res.json({ 
      success: true, 
      requests,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('List requests error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const get = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });

    if (!isAdminOrEmployee(req.user) && request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Add progress tracking based on status
    const progressSteps = [
      { status: 'pending', label: 'Request Submitted', completed: true, percentage: 20 },
      { status: 'in_review', label: 'Under Review', completed: request.status !== 'pending', percentage: 40 },
      { status: 'approved', label: 'Approved - Ready for Collection', completed: ['approved', 'document_generated'].includes(request.status), percentage: 70 },
      { status: 'document_generated', label: 'Document Generated - Ready for Collection', completed: request.status === 'document_generated', percentage: 100 },
    ];

    const currentProgress = progressSteps.find(step => step.status === request.status) || progressSteps[0];

    res.json({
      success: true,
      data: {
        ...request.toJSON(),
        progress: {
          currentStep: currentProgress.label,
          percentage: currentProgress.percentage,
          steps: progressSteps,
          isCompleted: request.status === 'document_generated',
          canDownload: request.status === 'document_generated' && request.pdfUrl
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    console.log('[Request Update] Starting update for request:', req.params.id, 'by user:', req.user?.id, 'role:', req.user?.role);
    
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      console.log('[Request Update] Request not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    if (!isAdminOrEmployee(req.user) && request.userId !== req.user.id) {
      console.log('[Request Update] Forbidden access - user:', req.user?.id, 'request owner:', request.userId);
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const payload = mapRequestPayload(req.body);
    const oldStatus = request.status;
    const targetStatus = payload.status;

    console.log('[Request Update] Payload:', payload, 'targetStatus:', targetStatus, 'oldStatus:', oldStatus);

    if (targetStatus && targetStatus !== oldStatus) {
      delete payload.status;
    }

    request.set(payload);
    if (targetStatus && targetStatus !== oldStatus) {
      try {
        const isAdmin = req.user.role === 'admin';
        console.log('[Request Update] Changing status from', oldStatus, 'to', targetStatus, 'isAdmin:', isAdmin);
        await RequestService.changeStatus(request, targetStatus, isAdmin);
      } catch (err) {
        console.log('[Request Update] Status change error:', err);
        return res.status(err.statusCode || 400).json({
          success: false,
          message: err.message || 'Invalid status transition'
        });
      }
    } else {
      await request.save();
      await request.reload();
    }

    if (targetStatus && targetStatus !== oldStatus) {
      console.log(`[Request] Status changed: ${oldStatus} → ${request.status}`, { requestId: request.id });
    }

    res.json({ success: true, data: request });
  } catch (err) {
    console.error('[Request Update Error]', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      requestId: req.params.id,
      userId: req.user?.id
    });
    const statusCode = err.statusCode || 500;
    const message = err.message || (err.errors ? err.errors.map(e => e.message).join(', ') : 'Server error');
    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
};

const reject = async (req, res) => {
  try {
    const rejectionData = {
      rejectionReason: req.body.rejectionReason || req.body.rejection_reason,
      adminNotes: req.body.adminNotes || req.body.admin_notes,
    };

    const request = await RequestService.rejectRequest(req.params.id, req.user.id, rejectionData);

    res.json({
      success: true,
      data: request,
      message: 'Request rejected successfully'
    });
  } catch (err) {
    console.error('Reject request error:', err);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server error',
      error: err.message
    });
  }
};

const getDocument = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });

    if (!isAdminOrEmployee(req.user) && request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    console.log('[PDF Download] Request status:', request.status, 'pdfUrl exists:', !!request.pdfUrl);

    if (!['approved', 'document_generated'].includes(request.status) || !request.pdfUrl) {
      console.log('[PDF Download] Document not ready. Status:', request.status);
      return res.json({
        success: true,
        data: {
          requestStatus: request.status,
          documentPDF: null,
          pickupLocation: 'Arrondissement Yaacoub El Mansour - Rabat',
        },
      });
    }

    // Verify PDF is not empty
    if (request.pdfUrl && !request.pdfUrl.startsWith('data:application/pdf')) {
      console.warn('[PDF Download] Invalid PDF URL format:', request.pdfUrl.substring(0, 50));
    }

    return res.json({
      success: true,
      data: {
        requestStatus: request.status,
        documentPDF: request.documentUrl || request.pdfUrl,
        pickupLocation: 'Arrondissement Yaacoub El Mansour - Rabat',
        preparationLocation: request.preparationLocation || 'Arrondissement Yaacoub El Mansour - Rabat',
      },
    });
  } catch (err) {
    console.error('[PDF Download] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });

    if (!isAdminOrEmployee(req.user)) {
      return res.status(403).json({ success: false, message: 'Employee or admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    request.documentUrl = `/uploads/${req.file.filename}`;
    request.pdfUrl = `/uploads/${req.file.filename}`;
    request.preparationLocation = req.body.preparationLocation || request.preparationLocation;
    try {
      await RequestService.changeStatus(request, 'document_generated');
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'Invalid status transition'
      });
    }

    console.log(`[Request] Document uploaded`, { requestId: request.id, status: request.status });

    res.json({
      success: true,
      data: request,
      message: 'Document uploaded successfully'
    });
  } catch (err) {
    console.error('Upload document error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role !== 'admin' && request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await request.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const startReview = async (req, res) => {
  try {
    const request = await RequestService.startReview(req.params.id, req.user.id);

    res.json({
      success: true,
      data: request,
      message: 'Request moved to review successfully'
    });
  } catch (err) {
    console.error('Start review error:', err);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server error',
      error: err.message
    });
  }
};

const generateDocument = async (req, res) => {
  try {
    const request = await RequestService.generateDocument(req.params.id, req.user.id);

    res.json({
      success: true,
      data: request,
      message: 'Document generated successfully'
    });
  } catch (err) {
    console.error('Generate document error:', err);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server error',
      error: err.message
    });
  }
};

const getRequestWithHistory = async (req, res) => {
  try {
    const requestWithHistory = await RequestService.getRequestWithHistory(req.params.id, req.user.role !== 'admin' ? req.user.id : null);

    res.json({
      success: true,
      data: requestWithHistory
    });
  } catch (err) {
    console.error('Get request with history error:', err);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server error',
      error: err.message
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (req.user.role !== 'admin' && request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (request.status !== 'document_generated' || !request.pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'Document not ready for download'
      });
    }

    // If pdfUrl is a base64 data URL, extract and serve as PDF
    if (request.pdfUrl.startsWith('data:application/pdf;base64,')) {
      const base64Data = request.pdfUrl.split(',')[1];
      const pdfBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${request.documentType}_${request.requestNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } else {
      // If it's a file path, serve the file
      const fs = require('fs');
      const path = require('path');

      if (fs.existsSync(request.pdfUrl)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${request.documentType}_${request.requestNumber}.pdf"`);
        res.sendFile(path.resolve(request.pdfUrl));
      } else {
        res.status(404).json({
          success: false,
          message: 'Document file not found'
        });
      }
    }
  } catch (err) {
    console.error('Download document error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during download'
    });
  }
};

// ============ TRACKING ENDPOINTS ============

const TrackingService = require('../services/trackingService');

const getTracking = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Request.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check authorization: user must be owner or admin
    if (req.user.role !== 'admin' && request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const trackingData = await TrackingService.getRequestTracking(requestId);

    if (!trackingData.success) {
      return res.status(400).json(trackingData);
    }

    res.json(trackingData);
  } catch (err) {
    console.error('Get tracking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tracking information'
    });
  }
};

const updateTracking = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { trackingStatus, notes } = req.body;
    const request = await Request.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only admin or employees can update tracking status
    if (!isAdminOrEmployee(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or employee can update tracking status'
      });
    }

    const result = await TrackingService.updateTrackingStatus(requestId, trackingStatus, notes);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Send notification to user
    if (request.userId) {
      await NotificationService.createNotification({
        userId: request.userId,
        type: 'request_tracking_updated',
        title: 'Statut de suivi mis à jour',
        message: `Le statut de votre demande est maintenant: ${TrackingService.TRACKING_STEPS[trackingStatus].label}`,
        relatedRequestId: requestId,
      }).catch(err => console.error('Notification error:', err));
    }

    console.log(`[Tracking] Updated request ${requestId} to ${trackingStatus}`);

    res.json({
      success: true,
      message: 'Tracking status updated successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Update tracking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating tracking status'
    });
  }
};

const getTrackingHistory = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Request.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const historyData = await TrackingService.getTrackingHistory(requestId);

    if (!historyData.success) {
      return res.status(400).json(historyData);
    }

    res.json(historyData);
  } catch (err) {
    console.error('Get tracking history error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tracking history'
    });
  }
};

const getAllTrackingSteps = async (req, res) => {
  try {
    const steps = TrackingService.getAllSteps();
    res.json({
      success: true,
      data: steps
    });
  } catch (err) {
    console.error('Get all tracking steps error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tracking steps'
    });
  }
};

module.exports = {
  create,
  list,
  get,
  update,
  reject,
  remove,
  getDocument,
  uploadDocument,
  startReview,
  generateDocument,
  getRequestWithHistory,
  downloadDocument,
  getTracking,
  updateTracking,
  getTrackingHistory,
  getAllTrackingSteps,
};