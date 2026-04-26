const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('../src/routes/authRoutes');
const userRoutes = require('../src/routes/userRoutes');
const communityRoutes = require('../src/routes/communityRoutes');
const postRoutes = require('../src/routes/postRoutes');
const commentRoutes = require('../src/routes/commentRoutes');
const healthRoutes = require('../src/routes/healthRoutes');
const resourceRoutes = require('../src/routes/resourceRoutes');
const { errorHandler } = require('../src/middleware/errorHandler');

// MongoDB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('Database Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
}

// Initialize Express app
const app = express();

// Middleware
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/resources', resourceRoutes);

// Error handling
app.use(errorHandler);

// Export for Vercel
module.exports = async (req, res) => {
  try {
    await connectDB();
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
