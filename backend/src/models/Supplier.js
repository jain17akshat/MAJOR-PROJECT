const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String },
  city: { type: String },
  state: { type: String, default: 'Maharashtra' },
  gstin: { type: String, trim: true },
  paymentTerms: { type: String, default: 'Net 30' },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
