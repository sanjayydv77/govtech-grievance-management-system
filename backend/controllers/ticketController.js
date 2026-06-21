const Ticket = require('../models/Ticket');
const { classifyComplaint } = require('../utils/geminiRotator');

// Helper to pull Cloudinary URLs from multer req.files
const extractMediaUrls = (files) => {
    if (!files || files.length === 0) return [];
    return files.map(file => file.path);
};

// Helper to generate unique complaint IDs
const generateTicketId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomHex = Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase().padStart(5, '0');
    return `DL-${dateStr}-${randomHex}`;
};

// ─────────────────────────────────────────────────────────────────
// CITIZEN — Create a new ticket
// ─────────────────────────────────────────────────────────────────
const createTicket = async (req, res) => {
    try {
        console.log('createTicket req.body:', req.body);
        console.log('createTicket req.files:', req.files);
        const { title, description, location, fullName, phone, email } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({ error: 'Title, description, and location are required' });
        }

        // Call Gemini Round-Robin logic for the department
        let department = 'Unknown';
        try {
            const aiClassification = await classifyComplaint(description);
            department = aiClassification.department || 'Unknown';
        } catch (aiError) {
            console.error('Gemini Classification failed, defaulting to Unknown:', aiError);
        }

        const citizenMedia = extractMediaUrls(req.files);

        const newTicket = new Ticket({
            ticketId: generateTicketId(),
            citizenId: req.user._id, // Populated by real auth middleware
            citizenName: fullName || null,
            citizenPhone: phone || null,
            citizenEmail: email || null,
            title,
            description,
            location,
            department,
            citizenMedia,
            status: 'Pending',
            verificationStatus: 'Pending'
        });

        await newTicket.save();

        res.status(201).json({
            message: 'Ticket created and classified successfully',
            ticket: newTicket
        });
    } catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ error: 'Server error processing ticket creation' });
    }
};

// ─────────────────────────────────────────────────────────────────
// CITIZEN — Get their own tickets
// ─────────────────────────────────────────────────────────────────
const getCitizenTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ citizenId: req.user._id })
            .populate('assignedOfficerId', 'name department email')
            .sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('GetCitizenTickets Error:', error);
        res.status(500).json({ error: 'Server error fetching your tickets' });
    }
};

// ─────────────────────────────────────────────────────────────────
// OFFICER — Get tickets assigned to them
// ─────────────────────────────────────────────────────────────────
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ assignedOfficerId: req.user._id })
            .populate('citizenId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('GetMyTickets Error:', error);
        res.status(500).json({ error: 'Server error fetching assigned tickets' });
    }
};

// ─────────────────────────────────────────────────────────────────
// OFFICER — Verify ticket (real/false) + upload field proof
// ─────────────────────────────────────────────────────────────────
const verifyTicket = async (req, res) => {
    try {
        const { verificationStatus } = req.body;
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.verificationStatus = verificationStatus;

        if (verificationStatus === 'Flagged False') {
            ticket.status = 'Rejected';
        } else if (verificationStatus === 'Verified Real' && ticket.status === 'Pending') {
            ticket.status = 'Assigned';
            ticket.assignedOfficerId = req.user._id; // Auto-assign verifying officer
        }

        const officerVerificationMedia = extractMediaUrls(req.files);
        if (officerVerificationMedia.length > 0) {
            ticket.officerVerificationMedia.push(...officerVerificationMedia);
        }

        if (req.body.remark) {
            ticket.officerRemarks.push({
                remark: req.body.remark,
                statusAtTime: ticket.status
            });
        }

        await ticket.save();
        res.status(200).json({ message: 'Ticket verification completed', ticket });
    } catch (error) {
        console.error('Verify Ticket Error:', error);
        res.status(500).json({ error: 'Server error verifying ticket' });
    }
};

// ─────────────────────────────────────────────────────────────────
// OFFICER — Update ticket to 'In Progress' + upload work media
// ─────────────────────────────────────────────────────────────────
const updateProgress = async (req, res) => {
    try {
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.status = 'In Progress';

        const officerProgressMedia = extractMediaUrls(req.files);
        if (officerProgressMedia.length > 0) {
            ticket.officerProgressMedia.push(...officerProgressMedia);
        }

        if (req.body.remark) {
            ticket.officerRemarks.push({
                remark: req.body.remark,
                statusAtTime: 'In Progress'
            });
        }

        await ticket.save();
        res.status(200).json({ message: 'Ticket progress updated', ticket });
    } catch (error) {
        console.error('Update Progress Error:', error);
        res.status(500).json({ error: 'Server error updating ticket progress' });
    }
};

// ─────────────────────────────────────────────────────────────────
// OFFICER — Mark as Resolved + upload resolution media
// ─────────────────────────────────────────────────────────────────
const resolveTicket = async (req, res) => {
    try {
        const { resolutionNotes } = req.body;
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.status = 'Resolved';
        const finalRemark = resolutionNotes || req.body.remark;
        if (finalRemark) {
            ticket.resolutionNotes = finalRemark;
            ticket.officerRemarks.push({
                remark: finalRemark,
                statusAtTime: 'Resolved'
            });
        }

        const officerResolutionMedia = extractMediaUrls(req.files);
        if (officerResolutionMedia.length > 0) {
            ticket.officerResolutionMedia.push(...officerResolutionMedia);
        }

        await ticket.save();
        res.status(200).json({ message: 'Ticket marked as resolved', ticket });
    } catch (error) {
        console.error('Resolve Ticket Error:', error);
        res.status(500).json({ error: 'Server error resolving ticket' });
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN — Get all tickets (full list with citizen & officer info)
// ─────────────────────────────────────────────────────────────────
const getAllTickets = async (req, res) => {
    try {
        // Optional filters via query params: ?status=Pending&department=PWD
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.department) filter.department = req.query.department;
        if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;

        const tickets = await Ticket.find(filter)
            .populate('citizenId', 'name email phone')
            .populate('assignedOfficerId', 'name department email')
            .sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('GetAllTickets Error:', error);
        res.status(500).json({ error: 'Server error fetching tickets' });
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN — Assign an officer to a ticket
// ─────────────────────────────────────────────────────────────────
const assignOfficer = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { officerId } = req.body;

        if (!officerId) {
            return res.status(400).json({ error: 'officerId is required' });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.assignedOfficerId = officerId;
        if (ticket.status === 'Pending') {
            ticket.status = 'Assigned'; // Escalate from pending to assigned
        }

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticketId)
            .populate('citizenId', 'name email phone')
            .populate('assignedOfficerId', 'name department email');

        res.status(200).json({ message: 'Officer assigned successfully', ticket: updatedTicket });
    } catch (error) {
        console.error('AssignOfficer Error:', error);
        res.status(500).json({ error: 'Server error assigning officer' });
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN — Add feedback message to a ticket
// ─────────────────────────────────────────────────────────────────
const addAdminFeedback = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { message } = req.body;

        if (!message) return res.status(400).json({ error: 'Message is required' });

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.adminMessages.push({ message });
        await ticket.save();

        res.status(200).json({ message: 'Feedback added successfully', ticket });
    } catch (error) {
        console.error('AddAdminFeedback Error:', error);
        res.status(500).json({ error: 'Server error adding feedback' });
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN & CM — Get aggregated statistics
// ─────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const [
            totalTickets,
            pendingCount,
            assignedCount,
            inProgressCount,
            resolvedCount,
            rejectedCount,
            pendingVerificationCount,
            departmentStats
        ] = await Promise.all([
            Ticket.countDocuments(),
            Ticket.countDocuments({ status: 'Pending' }),
            Ticket.countDocuments({ status: 'Assigned' }),
            Ticket.countDocuments({ status: 'In Progress' }),
            Ticket.countDocuments({ status: 'Resolved' }),
            Ticket.countDocuments({ status: 'Rejected' }),
            Ticket.countDocuments({ verificationStatus: 'Pending' }),
            Ticket.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        res.status(200).json({
            total: totalTickets,
            byStatus: {
                pending: pendingCount,
                assigned: assignedCount,
                inProgress: inProgressCount,
                resolved: resolvedCount,
                rejected: rejectedCount,
            },
            pendingVerification: pendingVerificationCount,
            byDepartment: departmentStats,
        });
    } catch (error) {
        console.error('GetStats Error:', error);
        res.status(500).json({ error: 'Server error fetching statistics' });
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN — Force-override ticket status (bypass officer flow)
// ─────────────────────────────────────────────────────────────────
const adminUpdateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticketId = req.params.id;

        const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.status = status;
        await ticket.save();

        const updated = await Ticket.findById(ticketId)
            .populate('citizenId', 'name email phone')
            .populate('assignedOfficerId', 'name department email');

        res.status(200).json({ message: `Status updated to '${status}' by admin`, ticket: updated });
    } catch (error) {
        console.error('AdminUpdateStatus Error:', error);
        res.status(500).json({ error: 'Server error updating ticket status' });
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN — Discharge officer from a ticket (unassign + reset to Pending)
// ─────────────────────────────────────────────────────────────────
const dischargeOfficer = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (!ticket.assignedOfficerId) {
            return res.status(400).json({ error: 'No officer is currently assigned to this ticket' });
        }

        ticket.assignedOfficerId = null;
        ticket.status = 'Pending'; // Reset so admin can reassign
        await ticket.save();

        res.status(200).json({ message: 'Officer discharged. Ticket reset to Pending.', ticket });
    } catch (error) {
        console.error('DischargeOfficer Error:', error);
        res.status(500).json({ error: 'Server error discharging officer' });
    }
};

// ─────────────────────────────────────────────────────────────────
// SHARED — Get single ticket details by MongoDB ID
// ─────────────────────────────────────────────────────────────────
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('citizenId', 'name email phone')
            .populate('assignedOfficerId', 'name department email');
            
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.status(200).json(ticket);
    } catch (error) {
        console.error('GetTicketById Error:', error);
        res.status(500).json({ error: 'Server error fetching ticket details' });
    }
};

const officerUpdateStatus = async (req, res) => {
    try {
        const { status, remark } = req.body;
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        if (status) {
            ticket.status = status;
            if (status === 'Resolved' || status === 'Closed') {
                if (remark) {
                    ticket.resolutionNotes = remark;
                }
            }
            if (status === 'Assigned') {
                ticket.verificationStatus = 'Verified Real';
            } else if (status === 'Rejected') {
                ticket.verificationStatus = 'Flagged False';
            }
        }

        const uploadedMedia = extractMediaUrls(req.files);
        if (uploadedMedia.length > 0) {
            if (status === 'Assigned' || status === 'Rejected') {
                ticket.officerVerificationMedia.push(...uploadedMedia);
            } else if (status === 'Resolved' || status === 'Closed') {
                ticket.officerResolutionMedia.push(...uploadedMedia);
            } else {
                ticket.officerProgressMedia.push(...uploadedMedia);
            }
        }

        if (remark) {
            ticket.officerRemarks.push({
                remark,
                statusAtTime: status || ticket.status
            });
        }

        await ticket.save();
        res.status(200).json({ message: 'Ticket status updated by officer', ticket });
    } catch (error) {
        console.error('OfficerUpdateStatus Error:', error);
        res.status(500).json({ error: 'Server error updating ticket status' });
    }
};

const getTicketByPublicId = async (req, res) => {
    try {
        const { ticketId } = req.params;
        if (!ticketId) {
            return res.status(400).json({ error: 'Ticket ID is required' });
        }

        // Search by ticketId case-insensitively
        const ticket = await Ticket.findOne({ 
            ticketId: { $regex: new RegExp(`^${ticketId}$`, 'i') } 
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Return only non-sensitive fields
        res.status(200).json({
            ticketId: ticket.ticketId,
            title: ticket.title,
            category: ticket.category || 'General',
            status: ticket.status,
            department: ticket.department || 'Nodal Cell',
            location: ticket.location,
            createdAt: ticket.createdAt
        });
    } catch (error) {
        console.error('GetTicketByPublicId Error:', error);
        res.status(500).json({ error: 'Server error retrieving ticket status' });
    }
};

module.exports = {
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
    adminUpdateStatus,
    dischargeOfficer,
    getTicketById,
    officerUpdateStatus,
    getTicketByPublicId,
};
