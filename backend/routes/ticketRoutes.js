import express from 'express';
import { Ticket } from '../models/Ticket.js';
import { classifyComplaint } from '../utils/geminiRotator.js';

const router = express.Router();

// @route   POST /api/tickets/create
// @desc    Create a new ticket and auto-classify department
router.post('/create', async (req, res) => {
    try {
        const { text, reporterName, reporterPhone } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Complaint text is required' });
        }

        // Call our Gemini API round-robin classifier
        const aiClassification = await classifyComplaint(text);
        const department = aiClassification.department || 'Unknown';

        // Save the new ticket
        const newTicket = new Ticket({
            text,
            reporterName,
            reporterPhone,
            department,
            status: 'Open'
        });

        await newTicket.save();

        res.status(201).json({
            message: 'Ticket created and classified successfully',
            ticket: newTicket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error processing the ticket creation' });
    }
});

export default router;
