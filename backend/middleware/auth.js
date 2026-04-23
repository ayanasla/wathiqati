const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn('Missing Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    // Validate Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      console.warn('Invalid Authorization header format:', authHeader.substring(0, 20));
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        console.warn('JWT verification failed:', jwtError.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      throw jwtError;
    }

    // Fetch user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.warn('User not found for token, ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user to request (handle both Sequelize and plain objects)
    req.user = user.toJSON ? user.toJSON() : user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Admin Role Authorization Middleware
 * Ensures user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Municipality Access Control Middleware
 * Ensures admin can only access requests from their municipality
 */
const requireMunicipalityAccess = (req, res, next) => {
  if (req.user.role === 'admin') {
    // For admin routes, check if the request belongs to their municipality
    const requestMunicipality = req.body.municipality || req.params.municipality;
    if (requestMunicipality && requestMunicipality !== req.user.municipality) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Can only manage requests from your municipality'
      });
    }
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  requireMunicipalityAccess
};