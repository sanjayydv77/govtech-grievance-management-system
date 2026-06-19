const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  citizenId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true // e.g., "Connaught Place, New Delhi"
  },
  department: { 
    type: String, 
    default: 'Pending AI Assignment' // The Round-Robin Gemini script will update this
  },
  assignedOfficerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  evidenceUrl: { 
    type: String, 
    default: null // In case they upload a photo of a pothole/leak
  },
  resolutionNotes: { 
    type: String,
    default: null // The officer fills this out when marking as 'Resolved'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);