const express = require('express');
const router = express.Router();
const { getOfficers, getAllUsers, deleteUser, seedPrivilegedUser, createUserByAdmin } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/users/officers
// @desc    Get all users with role 'officer'
// @access  Private (Admin)
router.get('/officers', protect, authorize('admin', 'cm'), getOfficers);

// @route   GET /api/users/all
// @desc    Get all users (admin management)
// @access  Private (Admin)
router.get('/all', protect, authorize('admin'), getAllUsers);

// @route   DELETE /api/users/:id
// @desc    Delete a user by ID
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), deleteUser);

// @route   POST /api/users/create
// @desc    Admin creates a new officer, admin, or cm account
// @access  Private (Admin)
router.post('/create', protect, authorize('admin'), createUserByAdmin);

// @route   POST /api/users/seed-privileged
// @desc    One-time seeding endpoint to create admin/cm users (uses x-seed-key header)
// @access  Special (requires x-seed-key = JWT_SECRET)
router.post('/seed-privileged', seedPrivilegedUser);

module.exports = router;
