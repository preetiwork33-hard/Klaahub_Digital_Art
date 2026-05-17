const User = require('../models/User');
const Artwork = require('../models/Artwork');

// GET /api/artists/:id
exports.getArtistProfile = async (req, res) => {
  try {
    const artist = await User.findOne({ _id: req.params.id, role: 'artist' });
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artists (List of artists)
exports.getArtistsList = async (req, res) => {
  try {
    const artists = await User.find({ role: 'artist', status: 'active' })
      .select('name avatar specialty bio joinedDate followers artworkCount rating isVerified');
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/artists/:id/follow
exports.toggleFollow = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const isFollowing = artist.followers.includes(req.user.id);
    if (isFollowing) {
      artist.followers.pull(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: artist._id } });
    } else {
      artist.followers.addToSet(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: artist._id } });
    }

    await artist.save();
    res.json({ success: true, following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artists/dashboard/stats (For Artist Dashboard)
exports.getArtistStats = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.id });
    const totalViews = artworks.reduce((sum, art) => sum + (art.views || 0), 0);
    const totalLikes = artworks.reduce((sum, art) => sum + (art.likesCount || 0), 0);
    const artworkCount = artworks.length;

    // Fetch artist info for totalRevenue
    const artist = await User.findById(req.user.id);

    // Dynamic sales calculation
    const salesCount = artworks.reduce((sum, art) => sum + (art.sales || 0), 0);

    res.json({
      success: true,
      stats: {
        revenue: artist.totalRevenue || 0,
        views: totalViews,
        likes: totalLikes,
        sales: salesCount,
        artworkCount,
        rating: artist.rating || 4.8,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
