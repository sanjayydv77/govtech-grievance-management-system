const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
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
    enum: [
      'Public Works Department (PWD)',
      'Delhi Jal Board (DJB)',
      'Transport Department',
      'Health & Family Welfare',
      'Education Directorate',
      'Power (BSES/Tata Power)',
      'Municipal Corporation of Delhi (MCD)',
      'Revenue Department',
      'Social Welfare',
      'Environment & Forest',
      'Women & Child Development',
      'Food & Civil Supplies',
      'Unclassified'
    ],
    default: 'Unclassified'
  },
  assignedOfficerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'], 
    default: 'Pending' 
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified Real', 'Flagged False'],
    default: 'Pending'
  },
  resolutionNotes: { 
    type: String,
    default: null // The officer fills this out when marking as 'Resolved'
  },
  // --- Media Arrays (Cloudinary URLs) ---
  citizenMedia: [{ 
    type: String 
  }],
  officerVerificationMedia: [{ 
    type: String 
  }],
  officerProgressMedia: [{ 
    type: String 
  }],
  officerResolutionMedia: [{ 
    type: String 
  }],
  adminMessages: [{
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);