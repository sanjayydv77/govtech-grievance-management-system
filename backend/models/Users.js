const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true // We will hash this with bcrypt later
  },
  role: { 
    type: String, 
    enum: ['citizen', 'officer', 'admin', 'cm'], 
    default: 'citizen' 
  },
  department: { 
    type: String, 
    // e.g., 'PWD', 'Delhi Jal Board', 'Electricity' - Only required for 'officer' role
    default: null 
  },
  phone: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);