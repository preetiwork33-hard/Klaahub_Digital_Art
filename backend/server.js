require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const artworkRoutes = require('./routes/artworks');
const orderRoutes = require('./routes/orders');
const artistRoutes = require('./routes/artists');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
app.use(express.json());

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'KlaaHub Premium API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Database & Server Boot
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  try {
    console.log(`Attempting to connect to MongoDB Atlas cluster...`);
    await mongoose.connect(MONGODB_URI);
    console.log(' Successfully connected to MongoDB Atlas database.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(' Database connection failed. Unable to connect to MongoDB Atlas.');
    console.error(`Error details: ${error.message}`);
    process.exit(1);
  }
}

startServer();
