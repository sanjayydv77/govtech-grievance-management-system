const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const {
    createTicket,
    getCitizenTickets,
    getMyTickets,
    verifyTicket,
    updateProgress,
    resolveTicket,
    getAllTickets,
    assignOfficer,
    addAdminFeedback,
    getStats,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────────
// CITIZEN ROUTES
// ─────────────────────────────────────────────────────────────────

// @route   POST /api/tickets/create
// @desc    Citizen submits a new ticket alongside media
// @access  Private (Citizen)
router.post(
    '/create',
    protect,
    authorize('citizen'),
    upload.array('media', 5),
    createTicket
);

// @route   GET /api/tickets/citizen
// @desc    Citizen fetches their own tickets
// @access  Private (Citizen)
router.get(
    '/citizen',
    protect,
    authorize('citizen'),
    getCitizenTickets
);

// ─────────────────────────────────────────────────────────────────
// OFFICER ROUTES
// ─────────────────────────────────────────────────────────────────

// @route   GET /api/tickets/my-tickets
// @desc    Officer fetches all tickets assigned to them
// @access  Private (Officer)
router.get(
    '/my-tickets',
    protect,
    authorize('officer'),
    getMyTickets
);

// @route   PUT /api/tickets/:id/verify
// @desc    Officer verifies if complaint is real/false + uploads field proof
// @access  Private (Officer)
router.put(
    '/:id/verify',
    protect,
    authorize('officer'),
    upload.array('media', 5),
    verifyTicket
);

// @route   PUT /api/tickets/:id/progress
// @desc    Officer updates ticket to 'In Progress' + uploads work media
// @access  Private (Officer)
router.put(
    '/:id/progress',
    protect,
    authorize('officer'),
    upload.array('media', 5),
    updateProgress
);

// @route   PUT /api/tickets/:id/resolve
// @desc    Officer marks as Resolved + uploads final resolution media
// @access  Private (Officer)
router.put(
    '/:id/resolve',
    protect,
    authorize('officer'),
    upload.array('media', 5),
    resolveTicket
);

// ─────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────

// @route   GET /api/tickets/all
// @desc    Admin / CM fetches all tickets (supports ?status= ?department= filters)
// @access  Private (Admin, CM)
router.get(
    '/all',
    protect,
    authorize('admin', 'cm'),
    getAllTickets
);

// @route   PUT /api/tickets/:id/assign
// @desc    Admin assigns an officer to a ticket
// @access  Private (Admin)
router.put(
    '/:id/assign',
    protect,
    authorize('admin'),
    assignOfficer
);

// @route   PUT /api/tickets/:id/feedback
// @desc    Admin adds feedback/message to a ticket
// @access  Private (Admin)
router.put(
    '/:id/feedback',
    protect,
    authorize('admin'),
    addAdminFeedback
);

// ─────────────────────────────────────────────────────────────────
// SHARED (Admin + CM)
// ─────────────────────────────────────────────────────────────────

// @route   GET /api/tickets/stats
// @desc    Get aggregated ticket statistics (by status, department)
// @access  Private (Admin, CM)
router.get(
    '/stats',
    protect,
    authorize('admin', 'cm'),
    getStats
);

module.exports = router;