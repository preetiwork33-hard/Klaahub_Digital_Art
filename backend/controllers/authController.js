const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const safeRole = ['buyer', 'artist'].includes(role) ? role : 'buyer';
    const user = await User.create({ name, email, password, role: safeRole });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, location, specialty, website, socials, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (specialty !== undefined) user.specialty = specialty;
    if (website !== undefined) user.website = website;
    if (socials !== undefined) user.socials = socials;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
