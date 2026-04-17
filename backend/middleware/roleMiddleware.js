const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

const requireEmployee = (req, res, next) => {
  if (!req.user || req.user.role !== 'employee') {
    return res.status(403).json({
      success: false,
      message: 'Employee access required'
    });
  }
  next();
};

const requireEmployeeOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Employee or admin access required'
    });
  }
  next();
};

module.exports = {
  requireRole,
  requireAdmin,
  requireEmployee,
  requireEmployeeOrAdmin,
};