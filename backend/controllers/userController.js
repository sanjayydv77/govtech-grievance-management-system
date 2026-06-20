const User = require('../models/Users');
const bcrypt = require('bcryptjs');

// @desc    Get all officers
// @route   GET /api/users/officers
// @access  Private (Admin)
const getOfficers = async (req, res) => {
    try {
        const officers = await User.find({ role: 'officer' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json(officers);
    } catch (error) {
        console.error('GetOfficers Error:', error);
        res.status(500).json({ error: 'Server error fetching officers' });
    }
};

// @desc    Get all users (any role)
// @route   GET /api/users/all
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('GetAllUsers Error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};

// @desc    Delete / deactivate a user by ID
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot delete your own account.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User removed successfully' });
    } catch (error) {
        console.error('DeleteUser Error:', error);
        res.status(500).json({ error: 'Server error deleting user' });
    }
};

// @desc    Seed an admin or CM user (one-time setup route)
// @route   POST /api/users/seed-privileged
// @access  Protected by a secret key header (not standard JWT — used for initial setup)
const seedPrivilegedUser = async (req, res) => {
    try {
        const seedKey = req.headers['x-seed-key'];
        if (seedKey !== process.env.JWT_SECRET) {
            return res.status(403).json({ error: 'Invalid seed key.' });
        }

        const { name, email, password, phone, role, department } = req.body;

        if (!['admin', 'cm', 'officer'].includes(role)) {
            return res.status(400).json({ error: 'This endpoint is for admin, cm, or officer roles.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || '0000000000',
            role,
            department: department || null,
        });

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
        };

        res.status(201).json({ message: `${role} user created successfully.`, user: userResponse });
    } catch (error) {
        console.error('SeedPrivilegedUser Error:', error);
        res.status(500).json({ error: 'Server error during user seeding.' });
    }
};

module.exports = {
    getOfficers,
    getAllUsers,
    deleteUser,
    seedPrivilegedUser,
};
