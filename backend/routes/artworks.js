const express = require('express');
const router = express.Router();
const {
  getArtworks,
  getCategoryStats,
  getFeatured,
  getTrending,
  getArtwork,
  getArtworksByArtist,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  toggleLike,
  rateArtwork
} = require('../controllers/artworkController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getArtworks);
router.get('/categories/stats', getCategoryStats);
router.get('/featured', getFeatured);
router.get('/trending', getTrending);
router.get('/:id', getArtwork);
router.get('/artist/:artistId', getArtworksByArtist);

router.post('/', protect, authorize('artist', 'admin'), createArtwork);
router.put('/:id', protect, updateArtwork);
router.delete('/:id', protect, deleteArtwork);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/rate', protect, rateArtwork);


module.exports = router;
