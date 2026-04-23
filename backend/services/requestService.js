const { Request, User } = require('../models');
const NotificationService = require('./notificationService');
const AuditLogService = require('./auditLogService');
const { generateRequestPDF } = require('../utils/pdfGenerator');
const logger = require('../utils/logger');

/**
 * Request State Machine States
 * CREATED → PENDING → IN_REVIEW → APPROVED → REJECTED → DOCUMENT_GENERATED
 */
const REQUEST_STATES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DOCUMENT_GENERATED: 'document_generated',
};

const ALLOWED_TRANSITIONS = {
  pending: ['in_review'],
  in_review: ['approved', 'rejected'],
  approved: ['document_generated'],
};

const VALID_STATUSES = Object.values(REQUEST_STATES);

/**
 * RequestService
 * Core business logic for request lifecycle management
 * Handles state transitions, validations, and side effects (notifications, audit logs)
 */
class RequestService {
  static async changeStatus(request, nextStatus, isAdmin = false) {
    const currentStatus = request._previousDataValues?.status || request.status;

    if (!VALID_STATUSES.includes(nextStatus)) {
      throw { statusCode: 400, message: `Invalid request status: ${nextStatus}` };
    }

    // Allow admins to bypass transition restrictions
    if (!isAdmin && !ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
      throw { statusCode: 400, message: `Invalid status transition from ${currentStatus} to ${nextStatus}` };
    }

    request.status = nextStatus;
    await request.save();
    await request.reload();
    return request;
  }
  /**
   * Create a new request
   */
  static async createRequest(userId, requestData) {
    try {
      const requestNumber = requestData.requestNumber || this.generateRequestNumber();

      const payload = {
        ...requestData,
        userId,
        requestNumber,
        status: REQUEST_STATES.PENDING,
        preparationLocation: requestData.preparationLocation || 'To be determined',
      };

      const request = await Request.create(payload);

      // Notify admins
      await this.notifyAdmins(
        'New Request Submitted',
        `New request ${request.requestNumber} submitted by ${request.firstNameFr} ${request.lastNameFr}`,
        request.id
      );

      // Log creation
      await AuditLogService.log({
        action: 'REQUEST_CREATED',
        entityType: 'request',
        entityId: request.id,
        userId,
        description: `User created request ${request.requestNumber}`,
        severity: 'info',
      });

      logger.info(`Request created: ${request.id}`, { requestNumber, userId });
      return request;
    } catch (error) {
      logger.error('Error creating request', error);
      throw error;
    }
  }

  /**
   * Move request to IN_REVIEW status (admin starts reviewing)
   */
  static async startReview(requestId, adminId) {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) throw { statusCode: 404, message: 'Request not found' };

      await this.changeStatus(request, REQUEST_STATES.IN_REVIEW);

      console.log(`[Request] Status changed: pending → in_review`, { requestId: request.id, requestNumber: request.requestNumber });

      // Log the state change
      await AuditLogService.log({
        action: 'REQUEST_IN_REVIEW',
        entityType: 'request',
        entityId: request.id,
        userId: adminId,
        description: `Admin started review of request ${request.requestNumber}`,
        changes: { status: `pending → in_review` },
        severity: 'info',
      });

      // Notify user
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Request Under Review',
        message: `Your request ${request.requestNumber} is now under review`,
        type: 'status_update',
        priority: 'normal',
        relatedEntityType: 'request',
        relatedEntityId: request.id,
      });

      return request;
    } catch (error) {
      logger.error('Error starting review', error);
      throw error;
    }
  }

  /**
   * Approve a request and optionally generate document
   */
  static async approveRequest(requestId, adminId, approvalData = {}) {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) throw { statusCode: 404, message: 'Request not found' };

      const oldStatus = request.status;
      const oldLocation = request.preparationLocation;

      request.approvedAt = new Date();
      request.adminNotes = approvalData.adminNotes || request.adminNotes;
      if (approvalData.preparationLocation) {
        request.preparationLocation = approvalData.preparationLocation;
      }
      // Explicitly save all fields before changing status to ensure data preservation
      await request.save();

      await this.changeStatus(request, REQUEST_STATES.APPROVED);


      // Generate PDF
      try {
        const pdfBuffer = await generateRequestPDF(request);
        if (pdfBuffer && pdfBuffer.length > 0) {
          request.pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
          await request.save();
          await request.reload();
        }
      } catch (pdfError) {
        logger.error('PDF generation error', { requestId, error: pdfError.message });
        // Don't fail if PDF generation fails - document can be generated later
      }

      // Log approval
      await AuditLogService.log({
        action: 'REQUEST_APPROVED',
        entityType: 'request',
        entityId: request.id,
        userId: adminId,
        description: `Admin approved request ${request.requestNumber}`,
        changes: {
          status: `${oldStatus} → ${REQUEST_STATES.APPROVED}`,
          preparationLocation: oldLocation !== request.preparationLocation ? `${oldLocation} → ${request.preparationLocation}` : undefined,
        },
        severity: 'info',
      });

      // Notify user
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Request Approved',
        message: `Your request ${request.requestNumber} has been approved and is ready for pickup`,
        type: 'approval',
        priority: 'high',
        relatedEntityType: 'request',
        relatedEntityId: request.id,
      });

      return request;
    } catch (error) {
      logger.error('Error approving request', error);

      // Log failed approval attempt
      await AuditLogService.log({
        action: 'REQUEST_APPROVED',
        entityType: 'request',
        entityId: requestId,
        userId: adminId,
        status: 'failure',
        errorMessage: error.message,
        severity: 'warning',
      });

      throw error;
    }
  }

  /**
   * Reject a request with reason
   */
  static async rejectRequest(requestId, adminId, rejectionData = {}) {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) throw { statusCode: 404, message: 'Request not found' };

      const oldStatus = request.status;

      request.rejectedAt = new Date();
      request.rejectionReason = rejectionData.rejectionReason || 'Rejected by admin';
      request.adminNotes = rejectionData.adminNotes || request.adminNotes;

      await this.changeStatus(request, REQUEST_STATES.REJECTED);


      console.log(`[Request] Status changed: ${oldStatus} → rejected`, { requestId: request.id, requestNumber: request.requestNumber });

      // Log rejection
      const changesObj = {
        status: `${oldStatus} → ${REQUEST_STATES.REJECTED}`,
        rejectionReason: request.rejectionReason,
      };

      if (rejectionData.adminNotes) {
        changesObj.adminNotes = rejectionData.adminNotes;
      }

      await AuditLogService.log({
        action: 'REQUEST_REJECTED',
        entityType: 'request',
        entityId: request.id,
        userId: adminId,
        description: `Admin rejected request ${request.requestNumber}: ${request.rejectionReason}`,
        changes: changesObj,
        severity: 'warning',
      });

      // Notify user
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Request Rejected',
        message: `Your request ${request.requestNumber} has been rejected. Reason: ${request.rejectionReason}`,
        type: 'rejection',
        priority: 'high',
        relatedEntityType: 'request',
        relatedEntityId: request.id,
      });

      return request;
    } catch (error) {
      logger.error('Error rejecting request', error);
      throw error;
    }
  }

  /**
   * Generate document for approved request
   */
  static async generateDocument(requestId, adminId) {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) throw { statusCode: 404, message: 'Request not found' };

      if (request.status !== REQUEST_STATES.APPROVED) {
        throw {
          statusCode: 400,
          message: `Cannot generate document for request in ${request.status} state. Request must be approved first.`,
        };
      }

      // Generate PDF
      if (!request.requestNumber || !request.nationalId) {
        throw {
          statusCode: 400,
          message: 'Cannot generate document - missing essential data (requestNumber or nationalId)',
        };
      }

      const pdfBuffer = await generateRequestPDF(request);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw {
          statusCode: 500,
          message: 'PDF generation returned empty buffer',
        };
      }
      request.pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
      request.generatedAt = new Date();
      if (!request.preparationLocation) {
        request.preparationLocation = 'Arrondissement Yaacoub El Mansour - Rabat';
      }
      // Explicitly save all fields before changing status to ensure data preservation
      await request.save();

      await this.changeStatus(request, REQUEST_STATES.DOCUMENT_GENERATED);

      console.log(`[Request] Status changed: approved → document_generated`, { requestId: request.id, requestNumber: request.requestNumber });

      // Log document generation
      await AuditLogService.log({
        action: 'DOCUMENT_GENERATED',
        entityType: 'request',
        entityId: request.id,
        userId: adminId,
        description: `Document generated for request ${request.requestNumber}`,
        changes: { status: `${REQUEST_STATES.APPROVED} → ${REQUEST_STATES.DOCUMENT_GENERATED}` },
        severity: 'info',
      });

      // Notify user
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Document Ready',
        message: `Your document for request ${request.requestNumber} is ready for pickup at ${request.preparationLocation}`,
        type: 'ready',
        priority: 'high',
        relatedEntityType: 'request',
        relatedEntityId: request.id,
      });

      return request;
    } catch (error) {
      logger.error('Error generating document', error);
      throw error;
    }
  }

  /**
   * Upload a document for a request
   */
  static async uploadDocument(requestId, adminId, fileData, metadata = {}) {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) throw { statusCode: 404, message: 'Request not found' };

      const oldStatus = request.status;

      // Update document info
      request.documentUrl = fileData.filePath;
      request.pdfUrl = fileData.filePath;
      request.generatedAt = new Date();

      if (!request.preparationLocation) {
        request.preparationLocation = 'Arrondissement Yaacoub El Mansour - Rabat';
      }
      if (metadata.preparationLocation) {
        request.preparationLocation = metadata.preparationLocation;
      }
      // Explicitly save all fields before changing status to ensure data preservation
      await request.save();

      await this.changeStatus(request, REQUEST_STATES.DOCUMENT_GENERATED);

      console.log(`[Request] Status changed: ${oldStatus} → document_generated`, { requestId: request.id, requestNumber: request.requestNumber });

      // Log upload
      await AuditLogService.log({
        action: 'DOCUMENT_UPLOADED',
        entityType: 'request',
        entityId: request.id,
        userId: adminId,
        description: `Document uploaded for request ${request.requestNumber}`,
        changes: {
          status: `${oldStatus} → ${REQUEST_STATES.DOCUMENT_GENERATED}`,
          documentUrl: fileData.filePath,
        },
        metadata: { fileName: fileData.fileName },
        severity: 'info',
      });

      // Notify user
      await NotificationService.createNotification({
        userId: request.userId,
        title: 'Document Ready',
        message: `Your document for request ${request.requestNumber} is ready at ${request.preparationLocation}`,
        type: 'ready',
        priority: 'high',
        relatedEntityType: 'request',
        relatedEntityId: request.id,
      });

      return request;
    } catch (error) {
      logger.error('Error uploading document', error);
      throw error;
    }
  }

  /**
   * Track file download
   */
  static async recordDownload(requestId, userId) {
    try {
      await AuditLogService.log({
        action: 'FILE_DOWNLOADED',
        entityType: 'request',
        entityId: requestId,
        userId,
        description: `User downloaded document for request`,
        severity: 'info',
      });
    } catch (error) {
      logger.warn('Error recording download', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Get request with full audit history
   */
  static async getRequestWithHistory(requestId, userId = null) {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) throw { statusCode: 404, message: 'Request not found' };

      // Check authorization
      if (userId && request.userId !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
      }

      // Get audit logs
      const auditLogs = await AuditLogService.getEntityLogs('request', requestId, 100);

      return {
        request,
        history: auditLogs,
      };
    } catch (error) {
      logger.error('Error getting request with history', error);
      throw error;
    }
  }

  /**
   * Utility: Generate a unique request number
   */
  static generateRequestNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REQ-${year}${month}-${random}`;
  }

  /**
   * Notify admins of important events
   */
  static async notifyAdmins(title, message, relatedEntityId) {
    try {
      const admins = await User.findAll({ where: { role: 'admin' } });
      await Promise.all(
        admins.map((admin) =>
          NotificationService.createNotification({
            userId: admin.id,
            title,
            message,
            type: 'admin_alert',
            priority: 'high',
            relatedEntityType: 'request',
            relatedEntityId,
          })
        )
      );
    } catch (error) {
      logger.warn('Error notifying admins', error);
      // Non-critical
    }
  }
}

module.exports = RequestService;
