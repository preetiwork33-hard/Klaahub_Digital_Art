const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role status joinedDate artworkCount');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/artworks
exports.getArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate('artist', 'name')
      .select('title price status sales imageUrl createdAt');

    // format for frontend table
    const formatted = artworks.map(a => ({
      _id: a._id,
      title: a.title,
      artist: a.artist?.name || 'Unknown Artist',
      price: a.price,
      status: a.status,
      sales: a.sales,
      imageUrl: a.imageUrl,
    }));

    res.json({ success: true, artworks: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/approve-artist/:id
exports.approveArtist = async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'User not found' });
    artist.status = 'active';
    artist.isVerified = true;
    await artist.save();
    res.json({ success: true, message: 'Artist approved and active!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
