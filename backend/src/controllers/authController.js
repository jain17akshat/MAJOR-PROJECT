const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register (admin only after first user)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: 'Email already registered.' });
  const user = await User.create({ name, email, password, role: role || 'staff' });
  res.status(201).json({ success: true, message: 'User registered successfully.', data: user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  const user = await User.findOne({ email });
  if (!user || !user.isActive)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  const token = generateToken(user._id);
  res.json({ success: true, message: 'Login successful.', token, data: user });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully.' });
});

module.exports = { register, login, getMe, changePassword };
