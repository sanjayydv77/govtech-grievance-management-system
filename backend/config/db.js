const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We use the URI from our .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure (Code 1) if DB connection fails
    process.exit(1); 
  }
};

module.exports = connectDB;