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

let isMockMode = false;
const mockRouter = express.Router();

// Mock Router Interceptor Middleware
app.use('/api', (req, res, next) => {
  if (isMockMode) {
    return mockRouter(req, res, next);
  }
  next();
});

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
  res.json({ message: isMockMode ? 'KlaaHub Premium API (Mock Mode) v1.0.0 is running' : 'KlaaHub Premium API v1.0.0 is running' });
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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klaahub';
const LOCAL_MONGODB_URI = 'mongodb://127.0.0.1:27017/klaahub';

async function connectDB(uri) {
  console.log(`🔌 Attempting to connect to database at: ${uri.split('@')[1] ? 'Atlas Cluster' : uri}`);
  await mongoose.connect(uri);
}

async function seedDatabase() {
  // Seed dummy data if DB is empty
  const Artwork = require('./models/Artwork');
  const User = require('./models/User');

  const artworkCount = await Artwork.countDocuments();
  if (artworkCount === 0) {
    console.log('🌱 No artworks found. Seeding beautiful initial items...');

    // Create a default admin/artist user
    let seedArtist = await User.findOne({ role: 'artist' });
    if (!seedArtist) {
      seedArtist = await User.create({
        name: 'Aria Nova',
        email: 'aria@demo.com',
        password: 'password123', // will be hashed automatically
        role: 'artist',
        specialty: 'Cyberpunk Art',
        bio: 'Digital artist specializing in cyberpunk and futuristic aesthetics. I create immersive digital worlds that blur the line between reality and imagination.',
        location: 'Mumbai, India',
        joinedDate: '2025-08',
        status: 'active',
        isVerified: true,
        artworkCount: 4,
        rating: 4.9,
        totalRevenue: 245000,
      });
    }

    // Standard initial artwork list
    const seedArtworks = [
      {
        title: 'Neon Dreamscape',
        description: 'A glowing futuristic metropolis painted under neon rain. The city is a canvas of neon cyan, deep magenta, and sapphire blue lights reflecting on a rainy, sleek concrete floor. Flying hovercars zip between towering skyscrapers adorned with holographic advertisements.',
        imageUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1000&q=80',
        artist: seedArtist._id,
        category: 'Cyberpunk',
        tags: ['neon', 'metropolis', 'futuristic', 'rain', 'cyberpunk', 'cityscape'],
        price: 2499,
        licenseType: 'Commercial',
        resolution: '3840x2160 (4K)',
        fileFormats: ['PNG', 'PSD'],
        isFeatured: true,
        isTrending: true,
        views: 342,
        likesCount: 124,
        rating: 4.8,
      },
      {
        title: 'Cyber Genesis',
        description: 'The birth of a cybernetic construct with detailed light circuits. An elegant android figure sitting in stasis, illuminated by a glowing cyan grid of circuits running down the arms and face. Represents the convergence of human emotion and advanced hardware.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80',
        artist: seedArtist._id,
        category: '3D Art',
        tags: ['android', 'cyborg', 'circuit', 'future', 'robot', 'stasis'],
        price: 3199,
        licenseType: 'Commercial',
        resolution: '4000x3000',
        fileFormats: ['PNG', 'FBX'],
        isFeatured: true,
        views: 218,
        likesCount: 89,
        rating: 4.6,
      },
      {
        title: 'Abstract Cosmos',
        description: 'Vibrant stellar dust clouds swirling together inside a custom glass crystal sphere. Rich purples, deep emerald greens, and high-intensity gold dust painting an astronomical scene inside a floating sphere in deep void space.',
        imageUrl: 'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=1000&q=80',
        artist: seedArtist._id,
        category: 'Abstract',
        tags: ['space', 'cosmos', 'abstract', 'crystal', 'galaxy', 'dust'],
        price: 1899,
        licenseType: 'Commercial',
        resolution: '3000x3000',
        fileFormats: ['PNG', 'JPG'],
        isTrending: true,
        views: 564,
        likesCount: 201,
        rating: 4.9,
      },
      {
        title: 'Digital Eden',
        description: 'A synthesis of cybernetics and nature showing a glowing tree of life. An organic tree with roots made of fiber-optic cables emitting soft blue light, spreading across a hyper-futuristic server room floor with a starry space sky above.',
        imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1000&q=80',
        artist: seedArtist._id,
        category: 'Concept Art',
        tags: ['nature', 'technology', 'eden', 'cyber', 'glow', 'roots'],
        price: 4299,
        licenseType: 'Extended',
        resolution: '4096x2160',
        fileFormats: ['PNG', 'PSD', 'TIFF'],
        isFeatured: true,
        views: 127,
        likesCount: 54,
        rating: 4.5,
      }
    ];

    await Artwork.insertMany(seedArtworks);
    console.log('✅ Initial seed data uploaded successfully!');
  }
}

async function startServer() {
  try {
    await connectDB(MONGODB_URI);
    console.log('⚡ Connected successfully to primary MongoDB Atlas.');
    await seedDatabase();
  } catch (primaryErr) {
    console.warn('⚠️ MongoDB Atlas Connection Failed. Attempting local MongoDB fallback...');
    try {
      await connectDB(LOCAL_MONGODB_URI);
      console.log('⚡ Connected successfully to local MongoDB.');
      await seedDatabase();
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB Connection Failed. Enabling Mock Mode fallback...');
      isMockMode = true;
      setupMockRoutes(mockRouter);
      console.log('🛡️ KlaaHub Server running in MOCK MODE (In-Memory Data Store).');
    }
  }

  app.listen(PORT, () => {
    console.log(`📡 KlaaHub Server started and listening on http://localhost:${PORT}`);
  });
}

// In-Memory Database Store for Mock Mode
const MOCK_STORE = {
  users: [
    { _id: 'u_aria', name: 'Aria Nova', email: 'aria@demo.com', role: 'artist', specialty: 'Cyberpunk Art', bio: 'Digital artist specializing in cyberpunk and futuristic aesthetics.', location: 'Mumbai, India', joinedDate: '2025-08', status: 'active', isVerified: true, artworkCount: 4, rating: 4.9, totalRevenue: 245000, following: [], followers: [], wishlist: [] },
    { _id: 'u_buyer', name: 'Rahul Sharma', email: 'rahul@demo.com', role: 'buyer', status: 'active', following: [], followers: [], wishlist: [], purchasedArtworks: [] },
    { _id: 'u_admin', name: 'KlaaHub Admin', email: 'admin@demo.com', role: 'admin', status: 'active', following: [], followers: [], wishlist: [] }
  ],
  artworks: [
    {
      _id: 'art_1',
      title: 'Neon Dreamscape',
      description: 'A glowing futuristic metropolis painted under neon rain. The city is a canvas of neon cyan, deep magenta, and sapphire blue lights reflecting on a rainy, sleek concrete floor. Flying hovercars zip between towering skyscrapers adorned with holographic advertisements.',
      imageUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1000&q=80',
      artist: { _id: 'u_aria', name: 'Aria Nova', specialty: 'Cyberpunk Art' },
      category: 'Cyberpunk',
      tags: ['neon', 'metropolis', 'futuristic', 'rain', 'cyberpunk', 'cityscape'],
      price: 2499,
      licenseType: 'Commercial',
      resolution: '3840x2160 (4K)',
      fileFormats: ['PNG', 'PSD'],
      isFeatured: true,
      isTrending: true,
      views: 342,
      likes: [],
      likesCount: 124,
      rating: 4.8,
      status: 'active'
    },
    {
      _id: 'art_2',
      title: 'Cyber Genesis',
      description: 'The birth of a cybernetic construct with detailed light circuits. An elegant android figure sitting in stasis, illuminated by a glowing cyan grid of circuits running down the arms and face. Represents the convergence of human emotion and advanced hardware.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80',
      artist: { _id: 'u_aria', name: 'Aria Nova', specialty: 'Cyberpunk Art' },
      category: '3D Art',
      tags: ['android', 'cyborg', 'circuit', 'future', 'robot', 'stasis'],
      price: 3199,
      licenseType: 'Commercial',
      resolution: '4000x3000',
      fileFormats: ['PNG', 'FBX'],
      isFeatured: true,
      views: 218,
      likes: [],
      likesCount: 89,
      rating: 4.6,
      status: 'active'
    },
    {
      _id: 'art_3',
      title: 'Abstract Cosmos',
      description: 'Vibrant stellar dust clouds swirling together inside a custom glass crystal sphere. Rich purples, deep emerald greens, and high-intensity gold dust painting an astronomical scene inside a floating sphere in deep void space.',
      imageUrl: 'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=1000&q=80',
      artist: { _id: 'u_aria', name: 'Aria Nova', specialty: 'Cyberpunk Art' },
      category: 'Abstract',
      tags: ['space', 'cosmos', 'abstract', 'crystal', 'galaxy', 'dust'],
      price: 1899,
      licenseType: 'Commercial',
      resolution: '3000x3000',
      fileFormats: ['PNG', 'JPG'],
      isTrending: true,
      views: 564,
      likes: [],
      likesCount: 201,
      rating: 4.9,
      status: 'active'
    },
    {
      _id: 'art_4',
      title: 'Digital Eden',
      description: 'A synthesis of cybernetics and nature showing a glowing tree of life. An organic tree with roots made of fiber-optic cables emitting soft blue light, spreading across a hyper-futuristic server room floor with a starry space sky above.',
      imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1000&q=80',
      artist: { _id: 'u_aria', name: 'Aria Nova', specialty: 'Cyberpunk Art' },
      category: 'Concept Art',
      tags: ['nature', 'technology', 'eden', 'cyber', 'glow', 'roots'],
      price: 4299,
      licenseType: 'Extended',
      resolution: '4096x2160',
      fileFormats: ['PNG', 'PSD', 'TIFF'],
      isFeatured: true,
      views: 127,
      likes: [],
      likesCount: 54,
      rating: 4.5,
      status: 'active'
    }
  ],
  orders: []
};

// Helper middleware to mock token decoding
function mockAuth(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  const user = MOCK_STORE.users.find(u => u._id === token || u.role === token);
  if (!user) return res.status(401).json({ message: 'Invalid token' });
  req.user = { id: user._id, role: user.role, email: user.email, name: user.name };
  next();
}

function setupMockRoutes(router) {
  // Mock Auth Routes
  router.post('/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const existing = MOCK_STORE.users.find(u => u.email === email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const newUser = {
      _id: 'u_' + Date.now(),
      name, email, role: role || 'buyer',
      status: 'active', following: [], followers: [], wishlist: [], purchasedArtworks: []
    };
    MOCK_STORE.users.push(newUser);
    res.json({ success: true, token: newUser._id, user: newUser });
  });

  router.post('/auth/login', (req, res) => {
    const { email } = req.body;
    const user = MOCK_STORE.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ success: true, token: user._id, user });
  });

  router.get('/auth/me', mockAuth, (req, res) => {
    const user = MOCK_STORE.users.find(u => u._id === req.user.id);
    res.json({ success: true, user });
  });

  router.put('/auth/profile', mockAuth, (req, res) => {
    const { name, bio, location, specialty, website, socials, avatar } = req.body;
    const user = MOCK_STORE.users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (specialty !== undefined) user.specialty = specialty;
    if (website !== undefined) user.website = website;
    if (socials !== undefined) user.socials = socials;
    if (avatar !== undefined) user.avatar = avatar;
    res.json({ success: true, user });
  });

  // Mock Artwork Routes
  router.get('/artworks', (req, res) => {
    const { search, category } = req.query;
    let list = MOCK_STORE.artworks;
    if (category) list = list.filter(a => a.category === category);
    if (search) list = list.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    res.json({ success: true, artworks: list, total: list.length });
  });

  router.get('/artworks/featured', (req, res) => {
    res.json({ success: true, artworks: MOCK_STORE.artworks.filter(a => a.isFeatured) });
  });

  router.get('/artworks/trending', (req, res) => {
    res.json({ success: true, artworks: MOCK_STORE.artworks.filter(a => a.isTrending) });
  });

  router.get('/artworks/:id', (req, res) => {
    const art = MOCK_STORE.artworks.find(a => a._id === req.params.id);
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ success: true, artwork: art });
  });

  router.get('/artworks/artist/:artistId', (req, res) => {
    const list = MOCK_STORE.artworks.filter(a => a.artist._id === req.params.artistId);
    res.json({ success: true, artworks: list, total: list.length });
  });

  router.post('/artworks', mockAuth, (req, res) => {
    const newArt = {
      _id: 'art_' + Date.now(),
      ...req.body,
      artist: { _id: req.user.id, name: req.user.name, specialty: 'Digital Art' },
      likes: [], likesCount: 0, views: 0, rating: 4.8, status: 'active'
    };
    MOCK_STORE.artworks.push(newArt);
    res.json({ success: true, artwork: newArt });
  });

  router.post('/artworks/:id/like', mockAuth, (req, res) => {
    const art = MOCK_STORE.artworks.find(a => a._id === req.params.id);
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    const idx = art.likes.indexOf(req.user.id);
    if (idx > -1) {
      art.likes.splice(idx, 1);
      art.likesCount -= 1;
    } else {
      art.likes.push(req.user.id);
      art.likesCount += 1;
    }
    res.json({ success: true, liked: idx === -1, likesCount: art.likesCount });
  });

  // Mock Wishlist Routes
  router.get('/wishlist', mockAuth, (req, res) => {
    const user = MOCK_STORE.users.find(u => u._id === req.user.id);
    const list = MOCK_STORE.artworks.filter(a => user.wishlist.includes(a._id));
    res.json({ success: true, wishlist: list });
  });

  router.post('/wishlist/:id', mockAuth, (req, res) => {
    const user = MOCK_STORE.users.find(u => u._id === req.user.id);
    const id = req.params.id;
    const idx = user.wishlist.indexOf(id);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(id);
    res.json({ success: true, inWishlist: idx === -1 });
  });

  // Mock Order Routes
  router.post('/orders', mockAuth, (req, res) => {
    const { items, totalAmount } = req.body;
    const newOrder = {
      _id: 'ord_' + Date.now(),
      buyer: req.user.id,
      items: items.map(it => {
        const a = MOCK_STORE.artworks.find(art => art._id === it.artworkId);
        return { artwork: a, price: it.price };
      }),
      totalAmount,
      status: 'completed',
      createdAt: new Date()
    };
    MOCK_STORE.orders.push(newOrder);

    // Update purchased inventory
    const user = MOCK_STORE.users.find(u => u._id === req.user.id);
    items.forEach(it => user.purchasedArtworks.push(it.artworkId));

    res.json({ success: true, order: newOrder });
  });

  router.post('/orders/verify', mockAuth, (req, res) => {
    res.json({ success: true, message: 'Payment verified successfully' });
  });

  router.get('/orders/my-orders', mockAuth, (req, res) => {
    const list = MOCK_STORE.orders.filter(o => o.buyer === req.user.id);
    const formatted = list.map(o => ({
      _id: o._id,
      artwork: o.items[0]?.artwork,
      amount: o.totalAmount,
      date: o.createdAt.toISOString().slice(0, 10),
      status: o.status
    }));
    res.json({ success: true, orders: formatted });
  });

  router.get('/orders/sales', mockAuth, (req, res) => {
    res.json({
      success: true,
      sales: MOCK_STORE.orders.map(o => ({
        _id: o._id,
        artworkTitle: o.items[0]?.artwork?.title || 'Artwork',
        amount: o.totalAmount,
        buyerName: 'Demo Buyer',
        date: o.createdAt.toISOString().slice(0, 10),
      }))
    });
  });

  // Mock Artist Routes
  router.get('/artists', (req, res) => {
    res.json({ success: true, artists: MOCK_STORE.users.filter(u => u.role === 'artist') });
  });

  router.get('/artists/stats/dashboard', mockAuth, (req, res) => {
    res.json({
      success: true,
      stats: { revenue: 245000, views: 1284, likes: 382, sales: 18, artworkCount: 4, rating: 4.9 }
    });
  });

  router.get('/artists/:id', (req, res) => {
    const artist = MOCK_STORE.users.find(u => u._id === req.params.id);
    res.json({ success: true, artist });
  });

  router.post('/artists/:id/follow', mockAuth, (req, res) => {
    const artist = MOCK_STORE.users.find(u => u._id === req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    const user = MOCK_STORE.users.find(u => u._id === req.user.id);
    const idx = user.following.indexOf(artist._id);
    if (idx > -1) {
      user.following.splice(idx, 1);
      artist.followers.splice(artist.followers.indexOf(user._id), 1);
    } else {
      user.following.push(artist._id);
      artist.followers.push(user._id);
    }
    res.json({ success: true, isFollowing: idx === -1 });
  });

  // Mock Admin Routes
  router.get('/admin/users', mockAuth, (req, res) => {
    res.json({ success: true, users: MOCK_STORE.users });
  });

  router.get('/admin/artworks', mockAuth, (req, res) => {
    const list = MOCK_STORE.artworks.map(a => ({
      _id: a._id,
      title: a.title,
      artist: a.artist.name,
      price: a.price,
      status: a.status,
      sales: 14,
      imageUrl: a.imageUrl
    }));
    res.json({ success: true, artworks: list });
  });

  router.post('/admin/approve-artist/:id', mockAuth, (req, res) => {
    const user = MOCK_STORE.users.find(u => u._id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isVerified = true;
    res.json({ success: true, user });
  });

  // Mock Upload Routes
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() });
  const { uploadImage } = require('./controllers/uploadController');
  const { analyzeArtworkImage } = require('./controllers/geminiController');

  router.post('/upload/image', mockAuth, upload.single('image'), uploadImage);
  router.post('/upload/analyze', mockAuth, analyzeArtworkImage);
}

startServer();
