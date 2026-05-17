const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const User = require('../models/User');

let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn('Razorpay initialization failed, operating in fallback/demo mode:', err.message);
}

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Double check item prices and details
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const artwork = await Artwork.findById(item.artworkId).populate('artist');
      if (!artwork) {
        return res.status(404).json({ message: `Artwork ${item.artworkId} not found` });
      }
      if (artwork.status === 'sold') {
        return res.status(400).json({ message: `Artwork "${artwork.title}" is already sold` });
      }
      orderItems.push({
        artwork: artwork._id,
        artist: artwork.artist._id,
        price: artwork.price,
        licenseType: artwork.licenseType,
      });
      calculatedTotal += artwork.price;
    }

    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({ message: 'Order total mismatch' });
    }

    // Create the DB order first in pending status
    const order = new Order({
      buyer: req.user.id,
      items: orderItems,
      totalAmount,
    });

    let razorpayOrderId = null;

    if (razorpay) {
      try {
        const options = {
          amount: Math.round(totalAmount * 100), // amount in paise
          currency: 'INR',
          receipt: `receipt_${order._id}`,
        };
        const rzpOrder = await razorpay.orders.create(options);
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.error('Razorpay Order Creation Error:', err.message);
        // If razorpay fails, we can fall back to demo mode if allowed
      }
    }

    order.payment = {
      method: razorpayOrderId ? 'razorpay' : 'demo',
      razorpayOrderId,
      status: 'pending',
    };

    await order.save();

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        razorpayOrderId: order.payment.razorpayOrderId,
        method: order.payment.method,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment.method === 'razorpay' && razorpay) {
      // Verify signature
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpaySignature) {
        order.status = 'failed';
        order.payment.status = 'failed';
        await order.save();
        return res.status(400).json({ message: 'Payment verification failed: Signature mismatch' });
      }
    }

    // Success flow - update order status
    order.status = 'completed';
    order.payment.status = 'paid';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.paidAt = new Date();

    // Generate license keys and dummy download URLs for each item
    order.licenseKeys = order.items.map(() => `LIC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`);
    order.downloadLinks = order.items.map((item) => `/api/downloads/${item.artwork}`);

    await order.save();

    // Mark artworks as sold (or increment sales), increment artist revenues, update buyer inventory
    for (const item of order.items) {
      await Artwork.findByIdAndUpdate(item.artwork, {
        $inc: { sales: 1 },
      });
      // Increment artist's total revenue (minus platform commission if you want, let's do 80% payout)
      const payout = Math.round(item.price * 0.8);
      await User.findByIdAndUpdate(item.artist, {
        $inc: { totalRevenue: payout },
      });
      // Add to buyer's purchased library
      await User.findByIdAndUpdate(order.buyer, {
        $addToSet: { purchasedArtworks: item.artwork },
      });
    }

    res.json({ success: true, message: 'Payment verified and order finalized!', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id, status: 'completed' })
      .populate({
        path: 'items.artwork',
        populate: { path: 'artist', select: 'name avatar specialty' }
      })
      .sort({ createdAt: -1 });

    // Format for buyer library
    const formatted = orders.map(o => {
      // Assuming single item per order check for simplicity, or map them out
      const firstItem = o.items[0];
      return {
        _id: o._id,
        artwork: firstItem?.artwork,
        amount: o.totalAmount,
        date: o.createdAt.toISOString().slice(0, 10),
        status: o.status,
      };
    });

    res.json({ success: true, orders: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/artist-sales (For Artist Dashboard)
exports.getArtistSales = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.artist': req.user.id, status: 'completed' })
      .populate('buyer', 'name email')
      .populate('items.artwork')
      .sort({ createdAt: -1 });

    const sales = [];
    orders.forEach(o => {
      o.items.forEach(item => {
        if (item.artist.toString() === req.user.id) {
          sales.push({
            orderId: o._id,
            buyerName: o.buyer?.name || 'Anonymous Collector',
            artworkTitle: item.artwork?.title || 'Unknown Artwork',
            amount: item.price,
            payout: Math.round(item.price * 0.8),
            date: o.createdAt.toISOString().slice(0, 10),
          });
        }
      });
    });

    res.json({ success: true, sales });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
