const Supplier = require('../models/Supplier');
const { asyncHandler } = require('../middleware/errorHandler');

const getSuppliers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { isActive: true };
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { contactPerson: new RegExp(search, 'i') }];
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [suppliers, total] = await Promise.all([
    Supplier.find(query).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
    Supplier.countDocuments(query),
  ]);
  res.json({ success: true, data: suppliers, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found.' });
  res.json({ success: true, data: supplier });
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, message: 'Supplier created.', data: supplier });
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found.' });
  res.json({ success: true, message: 'Supplier updated.', data: supplier });
});

const deleteSupplier = asyncHandler(async (req, res) => {
  await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Supplier deactivated.' });
});

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
