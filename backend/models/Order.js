const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, required: true },
    licenseType: String,
  }],
  totalAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  artistPayout: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  payment: {
    method: { type: String, enum: ['razorpay', 'stripe', 'demo'], default: 'razorpay' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  },
  licenseKeys: [String],
  downloadLinks: [String],
}, { timestamps: true });

// Auto-calculate fees
orderSchema.pre('save', function (next) {
  this.platformFee = Math.round(this.totalAmount * 0.20);
  this.artistPayout = this.totalAmount - this.platformFee;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
