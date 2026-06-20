const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Removed process.exit(1) so the server stays alive
    }
};

module.exports = connectDB;