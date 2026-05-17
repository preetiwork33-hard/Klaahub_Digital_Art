const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage } = require('../controllers/uploadController');
const { analyzeArtworkImage } = require('../controllers/geminiController');
const { protect } = require('../middlewares/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post('/image', protect, upload.single('image'), uploadImage);
router.post('/analyze', protect, analyzeArtworkImage);

module.exports = router;

