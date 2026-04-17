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
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    // Validate Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
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

    req.user = user.toJSON ? user.toJSON() : user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    console.error('Auth error:', error);
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
  if (req.user.role !== 'admin') {
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