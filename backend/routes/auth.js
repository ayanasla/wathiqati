const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.post('/change-password', authenticate, changePasswordValidation, changePassword);

module.exports = router;