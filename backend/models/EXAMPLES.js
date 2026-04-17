/**
 * MODEL USAGE EXAMPLES
 * Real-world examples of how to use Sequelize models in the Wathiqati project
 * 
 * These examples can be used in controllers, services, and API routes
 */

const {
  sequelize,
  User,
  DocumentType,
  Document,
  Request,
  Task,
  Notification,
} = require('../models');

// ============================================
// USER EXAMPLES
// ============================================

/**
 * Example 1: Create a new user (citizen)
 */
const createCitizen = async () => {
  try {
    const user = await User.create({
      firstName: 'Fatima',
      lastName: 'Mohammed',
      email: 'fatima.m@email.com',
      password: 'SecurePassword@123', // Will be hashed automatically
      role: 'citizen',
      nationalId: '98765432109876',
      address: 'Algiers, Algeria',
      phone: '+213 555 123 456',
      isActive: true,
    });
    console.log('User created:', user.toJSON());
    return user;
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
};

/**
 * Example 2: Find user by email and check password
 */
const authenticateUser = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found');
      return null;
    }

    // Use the comparePassword method
    const isValid = user.comparePassword(password);
    
    if (isValid) {
      console.log('Authentication successful');
      return user;
    } else {
      console.log('Invalid password');
      return null;
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
  }
};

/**
 * Example 3: Get user with all associated data
 */
const getUserWithAssociations = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          association: 'requests',
          include: ['documents', 'tasks'],
        },
        {
          association: 'assignedTasks',
          include: ['request'],
        },
        {
          association: 'notifications',
          where: { isRead: false },
          required: false,
        },
      ],
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error.message);
  }
};

// ============================================
// REQUEST EXAMPLES
// ============================================

/**
 * Example 4: Create a new document request
 */
const createDocumentRequest = async (userId, requestData) => {
  try {
    const request = await Request.create({
      requestNumber: `REQ-${Date.now()}`,
      userId: userId,
      requestType: requestData.requestType,
      status: 'pending',
      priority: 'medium',
      purpose: requestData.purpose,
      firstNameFr: requestData.firstNameFr,
      lastNameFr: requestData.lastNameFr,
      firstNameAr: requestData.firstNameAr,
      lastNameAr: requestData.lastNameAr,
      dateOfBirth: requestData.dateOfBirth,
      nationalId: requestData.nationalId,
      phone: requestData.phone,
    });

    // Create notification for admin
    await Notification.create({
      userId: userId,
      title: 'Request Submitted',
      message: `Your ${requestData.requestType} request has been submitted.`,
      type: 'request',
      relatedEntityType: 'Request',
      relatedEntityId: request.id,
      actionUrl: `/requests/${request.id}`,
    });

    return request;
  } catch (error) {
    console.error('Error creating request:', error.message);
  }
};

/**
 * Example 5: Get all pending requests with user and document info
 */
const getPendingRequests = async () => {
  try {
    const requests = await Request.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Document,
          as: 'documents',
          include: ['documentType'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return requests;
  } catch (error) {
    console.error('Error fetching requests:', error.message);
  }
};

/**
 * Example 6: Update request status
 */
const updateRequestStatus = async (requestId, status, adminNotes) => {
  try {
    const request = await Request.findByPk(requestId);
    
    if (!request) {
      console.log('Request not found');
      return null;
    }

    // Update based on status
    if (status === 'approved') {
      request.status = 'approved';
      request.approvedAt = new Date();
    } else if (status === 'rejected') {
      request.status = 'rejected';
      request.rejectedAt = new Date();
      request.rejectionReason = adminNotes;
    }

    request.adminNotes = adminNotes;
    await request.save();

    // Notify user
    const user = await User.findByPk(request.userId);
    await Notification.create({
      userId: request.userId,
      title: `Request ${status}`,
      message: `Your request has been ${status}.`,
      type: 'approval',
      relatedEntityType: 'Request',
      relatedEntityId: requestId,
      actionUrl: `/requests/${requestId}`,
    });

    return request;
  } catch (error) {
    console.error('Error updating request:', error.message);
  }
};

// ============================================
// DOCUMENT EXAMPLES
// ============================================

/**
 * Example 7: Create document for a request
 */
const createDocument = async (requestId, documentTypeId, filePath) => {
  try {
    const request = await Request.findByPk(requestId);
    const docType = await DocumentType.findByPk(documentTypeId);

    const document = await Document.create({
      title: `${request.requestType} - ${docType.name}`,
      requestId: requestId,
      documentTypeId: documentTypeId,
      filePath: filePath,
      fileName: filePath.split('/').pop(),
      status: 'pending',
    });

    return document;
  } catch (error) {
    console.error('Error creating document:', error.message);
  }
};

/**
 * Example 8: Get documents ready for pickup
 */
const getReadyDocuments = async () => {
  try {
    const documents = await Document.findAll({
      where: { status: 'ready' },
      include: [
        { model: Request, as: 'request', include: ['user'] },
        { model: DocumentType, as: 'documentType' },
      ],
      order: [['updatedAt', 'ASC']],
    });
    return documents;
  } catch (error) {
    console.error('Error fetching ready documents:', error.message);
  }
};

// ============================================
// TASK EXAMPLES
// ============================================

/**
 * Example 9: Create task and assign to employee
 */
const createTask = async (requestId, assignedUserId, taskData) => {
  try {
    const task = await Task.create({
      title: taskData.title || `Process request ${requestId}`,
      description: taskData.description,
      status: 'pending',
      priority: taskData.priority || 'medium',
      requestId: requestId,
      createdByUserId: taskData.createdByUserId, // Admin who created it
      assignedUserId: assignedUserId, // Employee to do it
      deadline: taskData.deadline,
    });

    // Notify assigned employee
    await Notification.create({
      userId: assignedUserId,
      title: 'New Task Assigned',
      message: task.title,
      type: 'task',
      relatedEntityType: 'Task',
      relatedEntityId: task.id,
      actionUrl: `/tasks/${task.id}`,
    });

    return task;
  } catch (error) {
    console.error('Error creating task:', error.message);
  }
};

/**
 * Example 10: Get tasks assigned to user
 */
const getUserTasks = async (userId, status = 'pending') => {
  try {
    const tasks = await Task.findAll({
      where: {
        assignedUserId: userId,
        status: status,
      },
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
        { model: Request, as: 'request', include: ['user'] },
      ],
      order: [['deadline', 'ASC']],
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
  }
};

// ============================================
// NOTIFICATION EXAMPLES
// ============================================

/**
 * Example 11: Send bulk notification to admins
 */
const notifyAdmins = async (title, message) => {
  try {
    const admins = await User.findAll({ where: { role: 'admin' } });

    for (const admin of admins) {
      await Notification.create({
        userId: admin.id,
        title: title,
        message: message,
        type: 'system',
        priority: 'high',
      });
    }

    console.log(`Notified ${admins.length} admins`);
  } catch (error) {
    console.error('Error notifying admins:', error.message);
  }
};

/**
 * Example 12: Get unread notifications for user
 */
const getUnreadNotifications = async (userId) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        userId: userId,
        isRead: false,
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
  }
};

/**
 * Example 13: Mark notification as read
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
  }
};

// ============================================
// DATABASE STATISTICS
// ============================================

/**
 * Example 14: Get dashboard statistics
 */
const getDashboardStats = async () => {
  try {
    const stats = {
      totalUsers: await User.count(),
      totalRequests: await Request.count(),
      pendingRequests: await Request.count({ where: { status: 'pending' } }),
      approvedRequests: await Request.count({ where: { status: 'approved' } }),
      rejectedRequests: await Request.count({ where: { status: 'rejected' } }),
      totalDocuments: await Document.count(),
      readyDocuments: await Document.count({ where: { status: 'ready' } }),
      totalTasks: await Task.count(),
      pendingTasks: await Task.count({ where: { status: 'pending' } }),
      usersByRole: await sequelize.query(
        'SELECT role, COUNT(*) as count FROM users GROUP BY role',
        { type: sequelize.QueryTypes.SELECT }
      ),
    };
    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error.message);
  }
};

// ============================================
// TRANSACTION EXAMPLE
// ============================================

/**
 * Example 15: Complex operation with transaction
 */
const approveRequestWithDocuments = async (requestId, adminId) => {
  let transaction;
  try {
    // Start transaction
    transaction = await sequelize.transaction();

    // 1. Update request status
    const request = await Request.findByPk(requestId, { transaction });
    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save({ transaction });

    // 2. Create all documents
    const docTypes = await DocumentType.findAll(
      { where: { isActive: true } },
      { transaction }
    );

    for (const docType of docTypes) {
      await Document.create({
        title: `${request.requestType} - ${docType.name}`,
        requestId: requestId,
        documentTypeId: docType.id,
        status: 'processing',
      }, { transaction });
    }

    // 3. Create processing task
    const user = await User.findByPk(request.userId, { transaction });
    await Task.create({
      title: `Process ${user.firstName} ${user.lastName} request`,
      requestId: requestId,
      createdByUserId: adminId,
      status: 'pending',
      priority: 'high',
    }, { transaction });

    // 4. Send notification
    await Notification.create({
      userId: request.userId,
      title: 'Request Approved',
      message: 'Your request has been approved and is being processed.',
      type: 'approval',
      relatedEntityType: 'Request',
      relatedEntityId: requestId,
    }, { transaction });

    // Commit transaction
    await transaction.commit();
    console.log('Transaction completed successfully');
    return request;
  } catch (error) {
    // Rollback on error
    if (transaction) await transaction.rollback();
    console.error('Transaction failed:', error.message);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // User examples
  createCitizen,
  authenticateUser,
  getUserWithAssociations,
  
  // Request examples
  createDocumentRequest,
  getPendingRequests,
  updateRequestStatus,
  
  // Document examples
  createDocument,
  getReadyDocuments,
  
  // Task examples
  createTask,
  getUserTasks,
  
  // Notification examples
  notifyAdmins,
  getUnreadNotifications,
  markNotificationAsRead,
  
  // Statistics
  getDashboardStats,
  
  // Advanced
  approveRequestWithDocuments,
};
