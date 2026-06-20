const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user (citizen or officer only)
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login and receive JWT token
// @access  Public
router.post('/login', login);

module.exports = router;
