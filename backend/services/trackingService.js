/**
 * Tracking Service
 * Manages the tracking/localization of document requests
 */

const { Request } = require('../models');

// Définition des étapes et leurs informations
const TRACKING_STEPS = {
  submitted: {
    order: 1,
    label: 'Demande soumise',
    labelEn: 'Request Submitted',
    description: 'Votre demande a été soumise au service',
    descriptionEn: 'Your request has been submitted',
    icon: 'FileText',
    color: 'blue',
  },
  in_processing: {
    order: 2,
    label: 'En traitement',
    labelEn: 'In Processing',
    description: 'Votre demande est en cours de traitement',
    descriptionEn: 'Your request is being processed',
    icon: 'Clock',
    color: 'yellow',
  },
  under_validation: {
    order: 3,
    label: 'En cours de validation',
    labelEn: 'Under Validation',
    description: 'Votre demande est en cours de validation par l\'administration',
    descriptionEn: 'Your request is under validation by administration',
    icon: 'CheckCircle',
    color: 'orange',
  },
  validated: {
    order: 4,
    label: 'Validée par l\'administration',
    labelEn: 'Validated by Administration',
    description: 'Votre demande a été validée avec succès',
    descriptionEn: 'Your request has been validated successfully',
    icon: 'Check',
    color: 'green',
  },
  ready_for_pickup: {
    order: 5,
    label: 'Prête à être récupérée',
    labelEn: 'Ready for Pickup',
    description: 'Votre document est prêt à être récupéré',
    descriptionEn: 'Your document is ready for pickup',
    icon: 'Package',
    color: 'green',
  },
  rejected: {
    order: 0,
    label: 'Rejetée',
    labelEn: 'Rejected',
    description: 'Votre demande a été rejetée',
    descriptionEn: 'Your request has been rejected',
    icon: 'X',
    color: 'red',
  },
};

/**
 * Get all tracking steps with their information
 */
const getAllSteps = () => {
  return Object.entries(TRACKING_STEPS)
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => a.order - b.order);
};

/**
 * Get current tracking info for a request
 */
const getRequestTracking = async (requestId) => {
  try {
    const request = await Request.findByPk(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const currentStep = TRACKING_STEPS[request.trackingStatus];
    const allSteps = getAllSteps();

    // Déterminer quelles étapes sont complétées
    const steps = allSteps.map((step) => ({
      ...step,
      completed: step.order > 0 && step.order < currentStep.order,
      current: step.key === request.trackingStatus,
    }));

    return {
      success: true,
      data: {
        requestId: request.id,
        currentStatus: request.trackingStatus,
        currentStep,
        steps,
        progress: currentStep.order > 0 ? (currentStep.order / 5) * 100 : 0,
        updatedAt: request.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Update tracking status (admin only)
 */
const updateTrackingStatus = async (requestId, newStatus, notes = '') => {
  try {
    // Validation
    if (!TRACKING_STEPS[newStatus]) {
      throw new Error(`Invalid tracking status: ${newStatus}`);
    }

    const request = await Request.findByPk(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Store previous status in adminNotes
    const timestamp = new Date().toISOString();
    const statusUpdate = `[${timestamp}] Statut: ${request.trackingStatus} → ${newStatus}`;
    const updatedNotes = request.adminNotes
      ? `${request.adminNotes}\n${statusUpdate}`
      : statusUpdate;

    if (notes) {
      updatedNotes += `\n   Notes: ${notes}`;
    }

    // Update request
    await request.update({
      trackingStatus: newStatus,
      adminNotes: updatedNotes,
    });

    return {
      success: true,
      message: 'Tracking status updated successfully',
      data: request,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Auto-update tracking status based on request status
 * Called automatically when request status changes
 */
const syncTrackingStatus = async (requestId, requestStatus) => {
  try {
    const request = await Request.findByPk(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    let newTrackingStatus = request.trackingStatus;

    // Map request status to tracking status
    switch (requestStatus) {
      case 'pending':
        newTrackingStatus = 'submitted';
        break;
      case 'in_review':
        newTrackingStatus = 'in_processing';
        break;
      case 'approved':
        newTrackingStatus = 'validated';
        break;
      case 'document_generated':
        newTrackingStatus = 'ready_for_pickup';
        break;
      case 'rejected':
        newTrackingStatus = 'rejected';
        break;
    }

    // Only update if different
    if (newTrackingStatus !== request.trackingStatus) {
      await request.update({ trackingStatus: newTrackingStatus });
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing tracking status:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get tracking history for a request
 */
const getTrackingHistory = async (requestId) => {
  try {
    const request = await Request.findByPk(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Parse adminNotes to extract tracking history
    const history = [];
    if (request.adminNotes) {
      const lines = request.adminNotes.split('\n');
      lines.forEach((line) => {
        if (line.includes('Statut:')) {
          history.push(line.trim());
        }
      });
    }

    return {
      success: true,
      data: {
        requestId,
        history,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  TRACKING_STEPS,
  getAllSteps,
  getRequestTracking,
  updateTrackingStatus,
  syncTrackingStatus,
  getTrackingHistory,
};
