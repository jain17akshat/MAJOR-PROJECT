const xlsx = require('xlsx');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const StockTransaction = require('../models/StockTransaction');

const generateReport = async (type, format, { startDate, endDate } = {}) => {
  let data = [];
  let sheetName = 'Report';

  if (type === 'products') {
    const products = await Product.find({ isActive: true }).populate('supplier', 'name').lean();
    data = products.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category,
      Unit: p.unit,
      'Quantity In Stock': p.quantity,
      'Low Stock Threshold': p.lowStockThreshold,
      'Cost Price (₹)': p.costPrice,
      'Selling Price (₹)': p.sellingPrice,
      'Profit Margin (%)': p.sellingPrice ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(2) : 0,
      'Inventory Value (₹)': (p.quantity * p.costPrice).toFixed(2),
      Supplier: p.supplier?.name || '',
      'Expiry Date': p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-IN') : '',
      'Batch No': p.batchNo || '',
    }));
    sheetName = 'Products';
  } else if (type === 'sales') {
    const query = {};
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    const sales = await Sale.find(query).populate('performedBy', 'name').lean();
    data = sales.map((s) => ({
      'Invoice No': s.invoiceNo,
      Date: new Date(s.createdAt).toLocaleDateString('en-IN'),
      Time: new Date(s.createdAt).toLocaleTimeString('en-IN'),
      Customer: s.customerName || 'Walk-in',
      Items: s.items.map((i) => `${i.productName} x${i.quantity}`).join(', '),
      'Subtotal (₹)': s.subtotal.toFixed(2),
      'GST (₹)': s.totalGst.toFixed(2),
      'Total (₹)': s.totalAmount.toFixed(2),
      'Profit (₹)': s.profit.toFixed(2),
      'Payment Mode': s.paymentMode,
      'Recorded By': s.performedBy?.name || '',
    }));
    sheetName = 'Sales';
  } else if (type === 'transactions') {
    const query = {};
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    const txns = await StockTransaction.find(query)
      .populate('product', 'name unit')
      .populate('performedBy', 'name')
      .lean();
    data = txns.map((t) => ({
      Date: new Date(t.createdAt).toLocaleDateString('en-IN'),
      Product: t.product?.name || '',
      Unit: t.product?.unit || '',
      Type: t.type,
      Quantity: t.quantity,
      'Previous Qty': t.previousQty,
      'New Qty': t.newQty,
      Reason: t.reason || '',
      'Performed By': t.performedBy?.name || '',
    }));
    sheetName = 'Stock Transactions';
  }

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, sheetName);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `AadishTraders_${type}_${timestamp}.xlsx`;
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return { buffer, filename, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
};

module.exports = { generateReport };
