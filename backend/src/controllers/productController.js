const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');
const xlsx = require('xlsx');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, search, category, lowStock, expiring, sortBy = 'createdAt', order = 'desc', isActive = 'true'
  } = req.query;

  const query = { isActive: isActive === 'true' };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (lowStock === 'true') query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
  if (expiring === 'true') {
    const days30 = new Date();
    days30.setDate(days30.getDate() + 30);
    query.expiryDate = { $lte: days30, $gte: new Date() };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(parseInt(limit)).populate('supplier', 'name phone'),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
  });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('supplier');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, data: product });
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created.', data: product });
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, message: 'Product updated.', data: product });
});

// DELETE /api/products/:id (soft delete)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, message: 'Product deactivated.' });
});

// POST /api/products/bulk-import
const bulkImport = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  if (!rows.length) return res.status(400).json({ success: false, message: 'File is empty.' });

  const results = { created: 0, updated: 0, errors: [] };
  for (const row of rows) {
    try {
      const filter = row.sku ? { sku: row.sku } : { name: row.name, category: row.category };
      await Product.findOneAndUpdate(filter, row, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
      results.created++;
    } catch (e) {
      results.errors.push({ row: row.name, error: e.message });
    }
  }
  res.json({ success: true, message: `Import complete. ${results.created} processed.`, data: results });
});

// GET /api/products/stats/summary
const getProductStats = asyncHandler(async (req, res) => {
  const [totalActive, lowStock, expiring, expired, totalValue] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
    Product.countDocuments({
      isActive: true,
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
    }),
    Product.countDocuments({ isActive: true, expiryDate: { $lt: new Date() } }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, value: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]),
  ]);
  res.json({
    success: true,
    data: {
      totalActive,
      lowStock,
      expiring,
      expired,
      inventoryValue: totalValue[0]?.value || 0,
    },
  });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, bulkImport, upload, getProductStats };
