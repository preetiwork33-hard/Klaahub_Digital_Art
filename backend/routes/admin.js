const express = require('express');
const router = express.Router();
const { getUsers, getArtworks, approveArtist } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Secure all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/artworks', getArtworks);
router.post('/approve-artist/:id', approveArtist);

module.exports = router;
