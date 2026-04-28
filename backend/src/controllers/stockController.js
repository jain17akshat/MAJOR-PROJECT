const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const alertService = require('../services/alertService');
const { asyncHandler } = require('../middleware/errorHandler');

const SYSTEM_USER_ID = '000000000000000000000001';

// POST /api/stock/in
const stockIn = asyncHandler(async (req, res) => {
  const { productId, quantity, unitPrice, batchNo, expiryDate, supplierId, notes, reason } = req.body;
  if (!productId || !quantity || quantity <= 0)
    return res.status(400).json({ success: false, message: 'Product and valid quantity required.' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const previousQty = product.quantity;
  product.quantity += Number(quantity);
  if (batchNo) product.batchNo = batchNo;
  if (expiryDate) product.expiryDate = expiryDate;
  if (supplierId) product.supplier = supplierId;
  await product.save();

  const transaction = await StockTransaction.create({
    product: productId,
    type: 'stock_in',
    quantity: Number(quantity),
    previousQty,
    newQty: product.quantity,
    unitPrice: unitPrice || product.costPrice,
    totalValue: quantity * (unitPrice || product.costPrice),
    batchNo,
    expiryDate,
    supplier: supplierId,
    reason: reason || 'Purchase',
    performedBy: SYSTEM_USER_ID,
    notes,
  });

  await alertService.checkSingleProduct(product);
  res.status(201).json({ success: true, message: 'Stock added successfully.', data: { transaction, product } });
});

// POST /api/stock/out
const stockOut = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, notes } = req.body;
  if (!productId || !quantity || quantity <= 0)
    return res.status(400).json({ success: false, message: 'Product and valid quantity required.' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  if (product.quantity < quantity)
    return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${product.quantity} ${product.unit}.` });

  const previousQty = product.quantity;
  product.quantity -= Number(quantity);
  await product.save();

  const transaction = await StockTransaction.create({
    product: productId,
    type: 'stock_out',
    quantity: Number(quantity),
    previousQty,
    newQty: product.quantity,
    unitPrice: product.costPrice,
    totalValue: quantity * product.costPrice,
    reason: reason || 'Sale',
    performedBy: SYSTEM_USER_ID,
    notes,
  });

  await alertService.checkSingleProduct(product);
  res.status(201).json({ success: true, message: 'Stock deducted successfully.', data: { transaction, product } });
});

// GET /api/stock/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, productId, startDate, endDate } = req.query;
  const query = {};
  if (type) query.type = type;
  if (productId) query.product = productId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [txns, total] = await Promise.all([
    StockTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('product', 'name unit category'),
    StockTransaction.countDocuments(query),
  ]);
  res.json({ success: true, data: txns, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
});

module.exports = { stockIn, stockOut, getTransactions };
