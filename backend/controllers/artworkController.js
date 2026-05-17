const Artwork = require('../models/Artwork');
const User = require('../models/User');

// GET /api/artworks
exports.getArtworks = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, category, sort = 'latest',
      priceMin, priceMax, license, minRating
    } = req.query;

    const query = { status: 'active' };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (license) query.licenseType = license;
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };

    const sortMap = {
      latest: { createdAt: -1 },
      trending: { views: -1, likes: -1 },
      most_viewed: { views: -1 },
      highest_rated: { rating: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [artworks, total] = await Promise.all([
      Artwork.find(query)
        .sort(sortMap[sort] || sortMap.latest)
        .skip(skip)
        .limit(Number(limit))
        .populate('artist', 'name avatar specialty'),
      Artwork.countDocuments(query),
    ]);

    res.json({ success: true, artworks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artworks/featured
exports.getFeatured = async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: 'active', isFeatured: true })
      .limit(9).populate('artist', 'name avatar');
    res.json({ success: true, artworks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artworks/trending
exports.getTrending = async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: 'active' })
      .sort({ views: -1, likesCount: -1 }).limit(6).populate('artist', 'name avatar');
    res.json({ success: true, artworks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artworks/:id
exports.getArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('artist', 'name avatar bio followers specialty artworkCount rating');
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ success: true, artwork });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artworks/artist/:artistId
exports.getArtworksByArtist = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.params.artistId, status: 'active' })
      .populate('artist', 'name avatar');
    res.json({ success: true, artworks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/artworks
exports.createArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.create({ ...req.body, artist: req.user.id });
    // Increment artist artwork count
    await User.findByIdAndUpdate(req.user.id, { $inc: { artworkCount: 1 } });
    res.status(201).json({ success: true, artwork });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/artworks/:id
exports.updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Not found' });
    if (artwork.artist.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, artwork: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/artworks/:id
exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Not found' });
    if (artwork.artist.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    await artwork.deleteOne();
    res.json({ success: true, message: 'Artwork deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/artworks/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Not found' });

    const liked = artwork.likes.includes(req.user.id);
    if (liked) {
      artwork.likes.pull(req.user.id);
      artwork.likesCount = Math.max(0, artwork.likesCount - 1);
    } else {
      artwork.likes.push(req.user.id);
      artwork.likesCount++;
    }
    await artwork.save();
    res.json({ success: true, liked: !liked, likesCount: artwork.likesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
