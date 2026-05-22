const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['buyer', 'artist', 'admin'], default: 'buyer' },
  avatar: { type: String, default: null },
  bio: { type: String, maxlength: 500 },
  location: { type: String },
  website: { type: String },
  socials: {
    twitter: String,
    instagram: String,
    portfolio: String,
  },
  status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
  isVerified: { type: Boolean, default: false },
  specialty: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
  purchasedArtworks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
  totalRevenue: { type: Number, default: 0 },
  joinedDate: { type: String, default: () => new Date().toISOString().slice(0, 7) },
  artworkCount: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
