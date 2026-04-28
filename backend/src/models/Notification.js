const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low_stock', 'expiry_warning', 'expiry_critical', 'stock_out', 'info'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  isRead: { type: Boolean, default: false, index: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
