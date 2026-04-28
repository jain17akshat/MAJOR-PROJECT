const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  gstRate: { type: Number, default: 5 },
  total: { type: Number, required: true },
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true },
  items: [saleItemSchema],
  subtotal: { type: Number, required: true },
  totalGst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  profit: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'upi', 'credit', 'cheque', 'neft'], default: 'cash' },
  customerName: { type: String },
  customerPhone: { type: String },
  notes: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

saleSchema.pre('save', function (next) {
  if (!this.invoiceNo) {
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.invoiceNo = `AT-${yy}${mm}-${rand}`;
  }
  next();
});

saleSchema.index({ createdAt: -1 });
saleSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Sale', saleSchema);
