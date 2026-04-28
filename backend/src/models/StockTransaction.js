const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { type: String, enum: ['stock_in', 'stock_out', 'adjustment', 'return'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  previousQty: { type: Number, required: true },
  newQty: { type: Number, required: true },
  unitPrice: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  reason: { type: String },
  batchNo: { type: String },
  expiryDate: { type: Date },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
}, { timestamps: true });

stockTransactionSchema.index({ createdAt: -1 });
stockTransactionSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
