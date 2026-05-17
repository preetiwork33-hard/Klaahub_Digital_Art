const express = require('express');
const router = express.Router();
const { getArtistProfile, getArtistsList, toggleFollow, getArtistStats } = require('../controllers/artistController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getArtistsList);
router.get('/stats/dashboard', protect, authorize('artist', 'admin'), getArtistStats);
router.get('/:id', getArtistProfile);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
