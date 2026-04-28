const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const alertService = require('../services/alertService');
const { asyncHandler } = require('../middleware/errorHandler');

const SYSTEM_USER_ID = '000000000000000000000001';

const createSale = asyncHandler(async (req, res) => {
  const { items, paymentMode, customerName, customerPhone, notes } = req.body;
  if (!items || !items.length)
    return res.status(400).json({ success: false, message: 'Sale items are required.' });

  let subtotal = 0, totalCost = 0, totalGst = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
    if (product.quantity < item.quantity)
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.quantity} ${product.unit}.` });

    const total = item.quantity * (item.unitPrice || product.sellingPrice);
    const gstAmount = (total * (product.gstRate || 5)) / 100;
    subtotal += total;
    totalCost += item.quantity * product.costPrice;
    totalGst += gstAmount;

    saleItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice || product.sellingPrice,
      costPrice: product.costPrice,
      gstRate: product.gstRate || 5,
      total,
    });

    const prevQty = product.quantity;
    product.quantity -= item.quantity;
    await product.save();

    await StockTransaction.create({
      product: product._id,
      type: 'stock_out',
      quantity: item.quantity,
      previousQty: prevQty,
      newQty: product.quantity,
      unitPrice: product.costPrice,
      totalValue: item.quantity * product.costPrice,
      reason: 'Sale',
      performedBy: SYSTEM_USER_ID,
    });

    await alertService.checkSingleProduct(product);
  }

  const totalAmount = subtotal + totalGst;
  const profit = subtotal - totalCost;

  const sale = await Sale.create({
    items: saleItems,
    subtotal,
    totalGst,
    totalAmount,
    totalCost,
    profit,
    paymentMode: paymentMode || 'cash',
    customerName,
    customerPhone,
    notes,
    performedBy: SYSTEM_USER_ID,
  });

  res.status(201).json({ success: true, message: 'Sale recorded.', data: sale });
});

const getSales = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, startDate, endDate, paymentMode } = req.query;
  const query = {};
  if (paymentMode) query.paymentMode = paymentMode;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); query.createdAt.$lte = end; }
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [sales, total] = await Promise.all([
    Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Sale.countDocuments(query),
  ]);
  res.json({ success: true, data: sales, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
});

const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' });
  res.json({ success: true, data: sale });
});

module.exports = { createSale, getSales, getSale };
