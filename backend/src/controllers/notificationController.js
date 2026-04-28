const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = unreadOnly === 'true' ? { isRead: false } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ isRead: false }),
  ]);
  res.json({ success: true, data: notifications, unreadCount, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
  res.json({ success: true, data: notification });
});

// PATCH /api/notifications/mark-all-read
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification deleted.' });
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
