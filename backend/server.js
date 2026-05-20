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

/* =========================
   CORS CONFIGURATION
========================= */
const allowedOrigins = [
  'http://localhost:5173',
  'https://digitalartplace.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }

  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
}));


/* =========================
   MIDDLEWARES
========================= */

app.use(morgan('dev'));

app.use(express.json({
  limit: '50mb'
}));

app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));

/* =========================
   ROUTES
========================= */

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

/* =========================
   BASE ROUTE
========================= */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'KlaaHub Premium API Running Successfully'
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

/* =========================
   DATABASE CONNECTION
========================= */

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {

  try {

    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB Connected Successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {

    console.error('MongoDB Connection Failed');
    console.error(error.message);

    process.exit(1);
  }
}

startServer();