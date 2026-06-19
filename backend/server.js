import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/tickets', ticketRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/delhi-cm-portal')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
  });
