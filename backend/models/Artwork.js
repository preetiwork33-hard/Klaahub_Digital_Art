const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 2000 },
  imageUrl: { type: String, required: true },
  gallery: [String],
  cloudinaryId: String,
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['Fantasy Art', 'Paintings', 'Concept Art', 'Illustrations', '3D Art', 'Anime', 'Abstract', 'Cyberpunk'],
    required: true,
  },
  tags: [String],
  price: { type: Number, required: true, min: 1 },
  licenseType: {
    type: String,
    enum: ['Personal', 'Commercial', 'Extended'],
    default: 'Commercial',
  },
  resolution: String,
  fileFormats: [String],
  status: { type: String, enum: ['active', 'pending', 'rejected', 'sold'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  downloadUrl: String,
}, { timestamps: true });

// Virtual for populated likes count
artworkSchema.virtual('isLiked').get(function () {
  return false; // set in controller with user context
});

// Text search index
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });
artworkSchema.index({ category: 1, status: 1 });
artworkSchema.index({ price: 1 });
artworkSchema.index({ artist: 1 });
artworkSchema.index({ isFeatured: 1, isTrending: 1 });

module.exports = mongoose.model('Artwork', artworkSchema);
