/**
 * API RESPONSE FORMAT - Wathiqati Backend
 * Standard response format for all API endpoints
 * Ensures consistency across the entire application
 */

/**
 * Success Response Format
 * Used for successful API calls
 */
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Error Response Format
 * Used for failed API calls
 */
const errorResponse = (message = 'Error', statusCode = 400, errors = null) => {
  return {
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Paginated Response Format
 * Used for list endpoints
 */
const paginatedResponse = (data, page = 1, limit = 10, total = 0, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Example Usage in Controllers
 */

// ========== SUCCESS EXAMPLES ==========

// Single resource
// GET /api/users/123
exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.status(200).json(successResponse(user, 'User fetched successfully'));
};

// Created resource
// POST /api/users
exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(successResponse(user, 'User created successfully', 201));
};

// List with pagination
// GET /api/users?page=1&limit=10
exports.listUsers = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.json(paginatedResponse(rows, page, limit, count, 'Users fetched successfully'));
};

// ========== ERROR EXAMPLES ==========

// Not found
exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    return res.status(404).json(errorResponse('User not found', 404));
  }
  
  res.json(successResponse(user));
};

// Validation error
exports.createUser = async (req, res) => {
  const errors = [];
  
  if (!req.body.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (!req.body.password || req.body.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  if (errors.length > 0) {
    return res.status(422).json(errorResponse('Validation failed', 422, errors));
  }
  
  const user = await User.create(req.body);
  res.status(201).json(successResponse(user, 'User created successfully', 201));
};

// Server error
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    await user.update(req.body);
    res.json(successResponse(user, 'User updated successfully'));
  } catch (error) {
    res.status(500).json(errorResponse(
      'An error occurred while updating user',
      500,
      { details: error.message }
    ));
  }
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
