const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders, getArtistSales } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/sales', protect, authorize('artist', 'admin'), getArtistSales);

module.exports = router;
