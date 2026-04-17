const { body, validationResult } = require('express-validator');
const { Request, User } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const NotificationService = require('../services/notificationService');
const RequestService = require('../services/requestService');

/**
 * Get Admin Requests
 * GET /api/admin/requests
 */
const getAdminRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      requests: requests.map(request => ({
        id: request.id,
        documentType: request.documentType,
        requestNumber: request.requestNumber,
        municipality: request.municipality,
        description: request.description,
        status: request.status,
        firstNameFr: request.firstNameFr,
        lastNameFr: request.lastNameFr,
        firstNameAr: request.firstNameAr,
        lastNameAr: request.lastNameAr,
        dateOfBirth: request.dateOfBirth,
        nationalId: request.nationalId,
        placeOfBirthFr: request.placeOfBirthFr,
        placeOfBirthAr: request.placeOfBirthAr,
        addressFr: request.addressFr,
        addressAr: request.addressAr,
        phone: request.phone,
        fatherNameFr: request.fatherNameFr,
        fatherNameAr: request.fatherNameAr,
        motherNameFr: request.motherNameFr,
        motherNameAr: request.motherNameAr,
        purpose: request.purpose,
        preparationLocation: request.preparationLocation,
        documentUrl: request.documentUrl,
        rejectionReason: request.rejectionReason,
        pdfUrl: request.pdfUrl,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        user: request.user
      })), 
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Approve Request
 * PUT /api/admin/requests/:id/approve
 */
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const preparationLocation = req.body.preparationLocation || 'Arrondissement Yaacoub El Mansour - Rabat';

    const request = await Request.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'in_review') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition'
      });
    }

    const oldStatus = request.status;

    // Generate PDF
    const pdfBuffer = await generateRequestPDF(request);

    // Save PDF to file
    const pdfFileName = `request_${request.id}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '..', 'uploads', pdfFileName);

    // Ensure uploads directory exists
    if (!fs.existsSync(path.dirname(pdfPath))) {
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    }

    fs.writeFileSync(pdfPath, pdfBuffer);

    request.pdfUrl = `/uploads/${pdfFileName}`;
    request.preparationLocation = preparationLocation;
    request.approvedAt = new Date();
    await RequestService.changeStatus(request, 'approved');

    console.log(`[Request] Status changed: ${oldStatus} → approved`, { requestId: request.id });

    // Send notification to user
    try {
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Request Approved',
        message: `Your ${request.documentType} request has been approved. You can collect your document at: ${preparationLocation}`,
        type: 'request_approved',
        metadata: {
          requestId: request.id,
          documentType: request.documentType,
          preparationLocation: preparationLocation
        }
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the approval if notification fails
    }

    res.json({
      success: true,
      data: request,
      message: 'Request approved successfully'
    });
  } catch (error) {
    console.error('[Approve Request Error]', error.message, { requestId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Server error during approval'
    });
  }
};

/**
 * Reject Request Validation Rules
 */
const rejectRequestValidation = [
  body('rejectionReason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
];

/**
 * Reject Request
 * PUT /api/admin/requests/:id/reject
 */
const rejectRequest = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await Request.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'in_review') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition'
      });
    }

    const oldStatus = request.status;

    request.rejectionReason = rejectionReason;
    request.rejectedAt = new Date();
    await RequestService.changeStatus(request, 'rejected');

    console.log(`[Request] Status changed: ${oldStatus} → rejected`, { requestId: request.id });

    // Send notification to user
    try {
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Request Rejected',
        message: `Your ${request.documentType} request has been rejected. Reason: ${rejectionReason}`,
        type: 'request_rejected',
        metadata: {
          requestId: request.id,
          rejectionReason: rejectionReason
        }
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    res.json({
      success: true,
      data: request,
      message: 'Request rejected successfully'
    });
  } catch (error) {
    console.error('[Reject Request Error]', error.message, { requestId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Server error during rejection'
    });
  }
};

/**
 * Generate PDF for Request
 */
const generateRequestPDF = (request) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Moroccan Administrative Document', { align: 'center' });
      doc.moveDown();

      doc.fontSize(16).text(`Document Type: ${request.documentType}`, { align: 'left' });
      doc.moveDown();

      // Request Details
      doc.fontSize(12).text(`Request ID: ${request.id}`);
      doc.text(`Municipality: ${request.municipality}`);
      doc.text(`Status: ${request.status.toUpperCase()}`);
      doc.text(`Submitted Date: ${request.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // User Information
      doc.fontSize(14).text('Applicant Information:', { underline: true });
      doc.fontSize(12).text(`Name: ${request.user.name}`);
      doc.text(`Email: ${request.user.email}`);
      doc.moveDown();

      // Description
      if (request.description) {
        doc.fontSize(14).text('Description:', { underline: true });
        doc.fontSize(12).text(request.description);
        doc.moveDown();
      }

      // Approval Info
      doc.fontSize(14).text('Approval Information:', { underline: true });
      doc.fontSize(12).text(`Approved Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Approved By: ${request.municipality} Administration`);
      doc.moveDown();

      // Footer
      doc.fontSize(10).text('This document is officially issued by the Moroccan Administration', {
        align: 'center',
        opacity: 0.7
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAdminRequests,
  approveRequest,
  rejectRequest,
  rejectRequestValidation
};