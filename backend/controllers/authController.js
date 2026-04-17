const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Register Validation Rules
 */
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isIn(['citizen', 'employee', 'admin'])
    .withMessage('Role must be citizen, employee, or admin'),
  body('department')
    .if(body('role').equals('employee'))
    .notEmpty()
    .withMessage('Department is required for employees'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be valid')
];

/**
 * Login Validation Rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be valid'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters')
];

const changePasswordValidation = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

/**
 * Register User
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, role = 'citizen', department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      department: role === 'employee' ? department : null,
      phone
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    });

    const { email, password } = req.body;
    console.log('Extracted email:', email);
    console.log('Extracted password length:', password ? password.length : 'undefined');
    console.log('Password value (first 3 chars):', password ? password.substring(0, 3) + '...' : 'undefined');

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('Validation passed, looking for user with email:', email);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordHashLength: user.password.length,
      passwordStartsWith: user.password.substring(0, 4),
      name: `${user.firstName} ${user.lastName}`
    });

    // Check password
    console.log('About to check password...');
    const passwordValid = user.checkPassword(password);
    console.log('Password check result:', passwordValid);

    // Also test direct bcrypt compare for debugging
    const bcrypt = require('bcryptjs');
    const directCompare = bcrypt.compareSync(password, user.password);
    console.log('Direct bcrypt compare result:', directCompare);

    if (!passwordValid) {
      console.log('Password validation failed for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account deactivated:', email);
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    console.log('Login successful for user:', email);

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, address } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    if (firstName) req.user.firstName = firstName;
    if (lastName) req.user.lastName = lastName;
    if (email) req.user.email = email;
    if (phone) req.user.phone = phone;
    if (address) req.user.address = address;

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

/**
 * Change Password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!req.user.checkPassword(oldPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const userData = req.user;

    res.json({
      success: true,
      user: {
        id: userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        phone: userData.phone
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
};