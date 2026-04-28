const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const supplierEmbedSchema = new mongoose.Schema({
  name: { type: String },
  contact: { type: String },
  email: { type: String },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  category: {
    type: String,
    required: true,
    enum: ['grains', 'pulses', 'oils', 'spices', 'dairy', 'beverages', 'packaged', 'flour', 'sugar_salt', 'other'],
    index: true,
  },
  sku: { type: String, unique: true, default: () => `SKU-${uuidv4().slice(0, 8).toUpperCase()}` },
  barcode: { type: String, trim: true },
  unit: { type: String, required: true, enum: ['kg', 'grams', 'liters', 'ml', 'packets', 'pieces', 'bags', 'quintals', 'boxes', 'dozens'] },
  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10, min: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierInfo: supplierEmbedSchema,
  expiryDate: { type: Date },
  batchNo: { type: String },
  description: { type: String },
  gstRate: { type: Number, default: 5, enum: [0, 5, 12, 18, 28] },
  hsCode: { type: String },
  minimumOrderQty: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true, index: true },
  imageUrl: { type: String },
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

productSchema.virtual('profit').get(function () {
  return this.sellingPrice - this.costPrice;
});

productSchema.virtual('profitMargin').get(function () {
  if (this.sellingPrice === 0) return 0;
  return (((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100).toFixed(2);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ name: 'text', barcode: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);
