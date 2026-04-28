const Sale = require('../models/Sale');
const Product = require('../models/Product');

const getSuggestions = async () => {
  const days7 = new Date();
  days7.setDate(days7.getDate() - 7);

  // Get avg daily sales per product over last 7 days
  const salesData = await Sale.aggregate([
    { $match: { createdAt: { $gte: days7 } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQtySold: { $sum: '$items.quantity' },
        productName: { $first: '$items.productName' },
      },
    },
  ]);

  const suggestions = [];
  for (const sale of salesData) {
    const product = await Product.findById(sale._id).select('name quantity lowStockThreshold unit costPrice');
    if (!product) continue;
    const avgDailySales = sale.totalQtySold / 7;
    const daysOfStock = avgDailySales > 0 ? Math.floor(product.quantity / avgDailySales) : 999;
    const suggestedReorder = Math.ceil(avgDailySales * 14); // 2-week supply

    if (daysOfStock <= 14 || product.quantity <= product.lowStockThreshold) {
      suggestions.push({
        productId: product._id,
        productName: product.name,
        unit: product.unit,
        currentStock: product.quantity,
        avgDailySales: avgDailySales.toFixed(2),
        daysOfStock,
        suggestedReorderQty: suggestedReorder,
        estimatedCost: suggestedReorder * product.costPrice,
        urgency: daysOfStock <= 3 ? 'critical' : daysOfStock <= 7 ? 'high' : 'medium',
      });
    }
  }

  return suggestions.sort((a, b) => a.daysOfStock - b.daysOfStock);
};

module.exports = { getSuggestions };
