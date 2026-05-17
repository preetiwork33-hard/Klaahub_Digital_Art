const User = require('../models/User');
const Artwork = require('../models/Artwork');

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: { path: 'artist', select: 'name avatar specialty' },
    });
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/wishlist/:id
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const artworkId = req.params.id;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const inWishlist = user.wishlist.includes(artworkId);
    if (inWishlist) {
      user.wishlist.pull(artworkId);
    } else {
      user.wishlist.push(artworkId);
    }

    await user.save();
    res.json({ success: true, inWishlist: !inWishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
