const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Ticket = require('../models/Ticket');

const test = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const ticket = await Ticket.findOne({});
    console.log('Sample ticket:', JSON.stringify(ticket, null, 2));
    process.exit(0);
};
test();
