const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Helper: Generate signed JWT for a user
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, department } = req.body;

        // --- Validation ---
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ message: 'All fields are required: name, email, password, phone, role.' });
        }

        // Block self-registration for privileged roles
        if (role === 'admin' || role === 'cm') {
            return res.status(403).json({ message: 'You cannot register with this role. Contact a system administrator.' });
        }

        if (!['citizen', 'officer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Allowed: citizen, officer.' });
        }

        if (role === 'officer' && !department) {
            return res.status(400).json({ message: 'Department is required for officer registration.' });
        }

        if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
        }

        // --- Check if user already exists ---
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // --- Hash password ---
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- Create user ---
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role,
            department: role === 'officer' ? department : null,
        });

        // --- Generate token ---
        const token = generateToken(newUser._id);

        // --- Return response (never return password) ---
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            department: newUser.department,
        };

        res.status(201).json({
            message: 'Registration successful!',
            user: userResponse,
            token,
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- Validation ---
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // --- Find user (include password for comparison) ---
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // --- Compare password ---
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // --- Generate token ---
        const token = generateToken(user._id);

        // --- Return response ---
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            department: user.department,
        };

        res.status(200).json({
            message: 'Login successful!',
            user: userResponse,
            token,
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { register, login };
