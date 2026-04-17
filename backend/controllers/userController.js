const { body, validationResult } = require('express-validator');
const { Request } = require('../models');

/**
 * Create Request Validation Rules
 */
const createRequestValidation = [
  body('document_type')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Document type must be between 2 and 100 characters'),
  body('municipality')
    .trim()
    .notEmpty()
    .withMessage('Municipality is required'),
  body('first_name_fr')
    .trim()
    .notEmpty()
    .withMessage('First name (French) is required'),
  body('last_name_fr')
    .trim()
    .notEmpty()
    .withMessage('Last name (French) is required'),
  body('first_name_ar')
    .trim()
    .notEmpty()
    .withMessage('First name (Arabic) is required'),
  body('last_name_ar')
    .trim()
    .notEmpty()
    .withMessage('Last name (Arabic) is required'),
  body('date_of_birth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date of birth must be in YYYY-MM-DD format'),
  body('national_id')
    .trim()
    .notEmpty()
    .withMessage('National ID is required'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

/**
 * Create Document Request
 * POST /api/user/requests
 */
const createRequest = async (req, res) => {
  try {
    // Debug: Log incoming request body
    console.log('Incoming request body:', req.body);

    // Check validation errors
    const errors = validationResult(req);
    console.log('Validation errors:', errors.array()); // Debug: Log validation errors
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      document_type, municipality, description,
      first_name_fr, last_name_fr, first_name_ar, last_name_ar,
      date_of_birth, place_of_birth_fr, place_of_birth_ar,
      national_id, address_fr, address_ar, phone,
      father_name_fr, father_name_ar, mother_name_fr, mother_name_ar,
      purpose, request_number, status
    } = req.body;

    // Generate request number when missing
    const requestNumberValue = request_number || `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create request
    const request = await Request.create({
      userId: req.user.id,
      documentType: document_type,
      requestNumber: requestNumberValue,
      municipality,
      description,
      firstNameFr: first_name_fr,
      lastNameFr: last_name_fr,
      firstNameAr: first_name_ar,
      lastNameAr: last_name_ar,
      dateOfBirth: date_of_birth,
      placeOfBirthFr: place_of_birth_fr,
      placeOfBirthAr: place_of_birth_ar,
      nationalId: national_id,
      addressFr: address_fr,
      addressAr: address_ar,
      phone,
      fatherNameFr: father_name_fr,
      fatherNameAr: father_name_ar,
      motherNameFr: mother_name_fr,
      motherNameAr: mother_name_ar,
      purpose,
      preparationLocation: req.body.preparation_location || null,
      documentUrl: req.body.document_url || null,
      pdfUrl: req.body.pdf_url || null,
      status: status || 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request: {
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
        preparationLocation: request.preparationLocation,
        documentUrl: request.documentUrl,
        pdfUrl: request.pdfUrl,
        rejectionReason: request.rejectionReason,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request creation'
    });
  }
};

/**
 * Get User's Requests
 * GET /api/user/requests
 */
const getUserRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
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
        updatedAt: request.updatedAt
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get Single Request
 * GET /api/user/requests/:id
 */
const getRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findOne({
      where: { id, userId: req.user.id }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      request: {
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
        updatedAt: request.updatedAt
      }
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getRequest,
  createRequestValidation
};