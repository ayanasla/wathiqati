const express = require('express');
const router = express.Router();
const {
  getAdminRequests,
  approveRequest,
  rejectRequest,
  rejectRequestValidation
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireEmployeeOrAdmin } = require('../middleware/roleMiddleware');

// All routes require authentication and employee/admin role
router.use(authenticate);
router.use(requireEmployeeOrAdmin);

// Request management routes
router.get('/requests', getAdminRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequestValidation, rejectRequest);

module.exports = router;