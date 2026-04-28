const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, role, isActive }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, message: 'User updated.', data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString())
    return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'User deactivated.' });
});

module.exports = { getUsers, updateUser, deleteUser };
