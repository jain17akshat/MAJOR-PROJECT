const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

const getDashboardKPIs = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const days30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [
    todaySales,
    monthSales,
    totalProducts,
    lowStock,
    expiring,
    outOfStock,
    inventoryValue,
  ] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } },
    ]),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
    Product.countDocuments({ isActive: true, expiryDate: { $lte: days30, $gte: new Date() } }),
    Product.countDocuments({ isActive: true, quantity: 0 }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, value: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]),
  ]);

  return {
    today: {
      revenue: todaySales[0]?.revenue || 0,
      profit: todaySales[0]?.profit || 0,
      sales: todaySales[0]?.count || 0,
    },
    month: {
      revenue: monthSales[0]?.revenue || 0,
      profit: monthSales[0]?.profit || 0,
      sales: monthSales[0]?.count || 0,
    },
    inventory: {
      totalProducts,
      lowStock,
      expiring,
      outOfStock,
      inventoryValue: inventoryValue[0]?.value || 0,
    },
  };
};

const getTrends = async (period = 'daily', days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let groupFormat;
  if (period === 'daily') groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  else if (period === 'weekly') groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
  else groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

  const trends = await Sale.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$totalAmount' },
        profit: { $sum: '$profit' },
        sales: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return trends.map((t) => ({ date: t._id, revenue: t.revenue, profit: t.profit, sales: t.sales }));
};

const getTopProducts = async (limit = 10, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return Sale.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        productName: { $first: '$items.productName' },
        totalQty: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);
};

const getSlowMovingProducts = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const soldProducts = await Sale.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' } } },
  ]);

  const soldIds = soldProducts.map((s) => s._id);
  const products = await Product.find({ isActive: true, quantity: { $gt: 0 } }).select('name category quantity unit costPrice sellingPrice');
  
  return products
    .filter((p) => !soldIds.some((id) => id?.toString() === p._id.toString()))
    .map((p) => ({ ...p.toObject(), daysSinceLastSale: days, stockValue: p.quantity * p.costPrice }))
    .slice(0, 20);
};

const getCategoryBreakdown = async () => {
  return Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        totalQty: { $sum: '$quantity' },
      },
    },
    { $sort: { totalValue: -1 } },
  ]);
};

module.exports = { getDashboardKPIs, getTrends, getTopProducts, getSlowMovingProducts, getCategoryBreakdown };
