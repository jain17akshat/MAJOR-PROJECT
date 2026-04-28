const Product = require('../models/Product');
const Notification = require('../models/Notification');

// Check a single product for low stock / expiry
const checkSingleProduct = async (product) => {
  try {
    const now = new Date();
    const days7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const days30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Low stock check
    if (product.quantity <= product.lowStockThreshold) {
      const existing = await Notification.findOne({
        product: product._id,
        type: 'low_stock',
        isRead: false,
        createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) },
      });
      if (!existing) {
        await Notification.create({
          type: product.quantity === 0 ? 'stock_out' : 'low_stock',
          title: product.quantity === 0 ? 'Out of Stock!' : 'Low Stock Alert',
          message: `${product.name} has only ${product.quantity} ${product.unit} remaining (threshold: ${product.lowStockThreshold}).`,
          product: product._id,
          productName: product.name,
          severity: product.quantity === 0 ? 'critical' : 'high',
        });
      }
    }

    // Expiry check
    if (product.expiryDate) {
      if (product.expiryDate <= days7) {
        await Notification.create({
          type: 'expiry_critical',
          title: 'Critical: Expiring Soon!',
          message: `${product.name} expires on ${product.expiryDate.toLocaleDateString('en-IN')} — within 7 days.`,
          product: product._id,
          productName: product.name,
          severity: 'critical',
        });
      } else if (product.expiryDate <= days30) {
        await Notification.create({
          type: 'expiry_warning',
          title: 'Expiry Warning',
          message: `${product.name} expires on ${product.expiryDate.toLocaleDateString('en-IN')} — within 30 days.`,
          product: product._id,
          productName: product.name,
          severity: 'medium',
        });
      }
    }
  } catch (err) {
    console.error('Alert check error:', err.message);
  }
};

// Bulk daily check for all products
const checkLowStockAlerts = async () => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  });
  for (const p of products) await checkSingleProduct(p);
  console.log(`Low stock check: ${products.length} products flagged.`);
};

const checkExpiryAlerts = async () => {
  const days30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const products = await Product.find({
    isActive: true,
    expiryDate: { $lte: days30, $gte: new Date() },
  });
  for (const p of products) await checkSingleProduct(p);
  console.log(`Expiry check: ${products.length} products flagged.`);
};

module.exports = { checkSingleProduct, checkLowStockAlerts, checkExpiryAlerts };
