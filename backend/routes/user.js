const express = require('express');
const router = express.Router();
const {
  createRequest,
  getUserRequests,
  getRequest,
  createRequestValidation
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Request routes
router.post('/requests', createRequestValidation, createRequest);
router.get('/requests', getUserRequests);
router.get('/requests/:id', getRequest);

module.exports = router;