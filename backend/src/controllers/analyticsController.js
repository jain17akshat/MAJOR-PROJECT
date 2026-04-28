const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const analyticsService = require('../services/analyticsService');
const restockService = require('../services/restockService');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/analytics/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardKPIs();
  res.json({ success: true, data });
});

// GET /api/analytics/trends?period=daily|weekly|monthly
const getTrends = asyncHandler(async (req, res) => {
  const { period = 'daily', days = 30 } = req.query;
  const data = await analyticsService.getTrends(period, parseInt(days));
  res.json({ success: true, data });
});

// GET /api/analytics/top-products
const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 10, days = 30 } = req.query;
  const data = await analyticsService.getTopProducts(parseInt(limit), parseInt(days));
  res.json({ success: true, data });
});

// GET /api/analytics/slow-moving
const getSlowMoving = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await analyticsService.getSlowMovingProducts(parseInt(days));
  res.json({ success: true, data });
});

// GET /api/analytics/category-breakdown
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCategoryBreakdown();
  res.json({ success: true, data });
});

// GET /api/analytics/restock-suggestions
const getRestockSuggestions = asyncHandler(async (req, res) => {
  const data = await restockService.getSuggestions();
  res.json({ success: true, data });
});

module.exports = { getDashboard, getTrends, getTopProducts, getSlowMoving, getCategoryBreakdown, getRestockSuggestions };
