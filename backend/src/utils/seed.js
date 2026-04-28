require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Sale = require('../models/Sale');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');
  // Drop collections to clear stale indexes
  const collections = ['users','suppliers','products','stocktransactions','sales','auditlogs','notifications'];
  for (const col of collections) {
    try { await mongoose.connection.db.dropCollection(col); } catch {}
  }

  // Users
  const admin = await User.create({
    name: 'Aadish Admin',
    email: 'admin@aadishtraders.com',
    password: 'Admin@123',
    role: 'admin',
  });
  const staff = await User.create({
    name: 'Ravi Staff',
    email: 'staff@aadishtraders.com',
    password: 'Staff@123',
    role: 'staff',
  });
  console.log('✅ Users created');

  // Suppliers
  const suppliers = await Supplier.insertMany([
    { name: 'Mahesh Grains Pvt Ltd', contactPerson: 'Mahesh Patil', phone: '9876543210', city: 'Pune', gstin: '27AABCM1234A1Z5' },
    { name: 'Sharma Oil Mills', contactPerson: 'Ramesh Sharma', phone: '9811234567', city: 'Nagpur', gstin: '27AABCS5678B2Z3' },
    { name: 'Spice India Traders', contactPerson: 'Suresh Kumar', phone: '9823456789', city: 'Mumbai' },
    { name: 'National Foods Co', contactPerson: 'Priya Nair', phone: '9845671234', city: 'Nashik' },
  ]);
  console.log('✅ Suppliers created');

  // Products
  const expiryFuture = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
  const products = await Product.insertMany([
    { name: 'Basmati Rice (Premium)', category: 'grains', unit: 'kg', costPrice: 75, sellingPrice: 95, quantity: 500, lowStockThreshold: 50, supplier: suppliers[0]._id, gstRate: 5, batchNo: 'BATCH-001' },
    { name: 'Sona Masoori Rice', category: 'grains', unit: 'kg', costPrice: 55, sellingPrice: 70, quantity: 300, lowStockThreshold: 50, supplier: suppliers[0]._id, gstRate: 5 },
    { name: 'Wheat Flour (Aashirvaad)', category: 'flour', unit: 'kg', costPrice: 38, sellingPrice: 48, quantity: 400, lowStockThreshold: 40, supplier: suppliers[0]._id, expiryDate: expiryFuture(120), gstRate: 0 },
    { name: 'Whole Wheat (Gehun)', category: 'grains', unit: 'kg', costPrice: 28, sellingPrice: 36, quantity: 8, lowStockThreshold: 30, supplier: suppliers[0]._id, gstRate: 0 },
    { name: 'Toor Dal (Arhar)', category: 'pulses', unit: 'kg', costPrice: 110, sellingPrice: 140, quantity: 200, lowStockThreshold: 20, supplier: suppliers[3]._id, gstRate: 5 },
    { name: 'Moong Dal (Split)', category: 'pulses', unit: 'kg', costPrice: 95, sellingPrice: 120, quantity: 150, lowStockThreshold: 15, supplier: suppliers[3]._id, gstRate: 5 },
    { name: 'Chana Dal', category: 'pulses', unit: 'kg', costPrice: 80, sellingPrice: 100, quantity: 180, lowStockThreshold: 20, supplier: suppliers[3]._id, gstRate: 5 },
    { name: 'Masoor Dal (Red)', category: 'pulses', unit: 'kg', costPrice: 90, sellingPrice: 115, quantity: 5, lowStockThreshold: 15, supplier: suppliers[3]._id, gstRate: 5 },
    { name: 'Sunflower Oil (1L)', category: 'oils', unit: 'liters', costPrice: 130, sellingPrice: 160, quantity: 200, lowStockThreshold: 25, supplier: suppliers[1]._id, expiryDate: expiryFuture(180), gstRate: 5 },
    { name: 'Groundnut Oil (1L)', category: 'oils', unit: 'liters', costPrice: 145, sellingPrice: 180, quantity: 100, lowStockThreshold: 20, supplier: suppliers[1]._id, expiryDate: expiryFuture(90), gstRate: 5 },
    { name: 'Mustard Oil (1L)', category: 'oils', unit: 'liters', costPrice: 155, sellingPrice: 190, quantity: 80, lowStockThreshold: 15, supplier: suppliers[1]._id, expiryDate: expiryFuture(15), gstRate: 5 },
    { name: 'Turmeric Powder (Haldi)', category: 'spices', unit: 'kg', costPrice: 150, sellingPrice: 200, quantity: 50, lowStockThreshold: 10, supplier: suppliers[2]._id, expiryDate: expiryFuture(365), gstRate: 5 },
    { name: 'Red Chilli Powder', category: 'spices', unit: 'kg', costPrice: 180, sellingPrice: 240, quantity: 40, lowStockThreshold: 10, supplier: suppliers[2]._id, expiryDate: expiryFuture(300), gstRate: 5 },
    { name: 'Cumin Seeds (Jeera)', category: 'spices', unit: 'kg', costPrice: 250, sellingPrice: 320, quantity: 30, lowStockThreshold: 5, supplier: suppliers[2]._id },
    { name: 'Coriander Powder (Dhaniya)', category: 'spices', unit: 'kg', costPrice: 120, sellingPrice: 160, quantity: 35, lowStockThreshold: 8, supplier: suppliers[2]._id },
    { name: 'Sugar (M30)', category: 'sugar_salt', unit: 'kg', costPrice: 42, sellingPrice: 52, quantity: 600, lowStockThreshold: 60, supplier: suppliers[3]._id, gstRate: 5 },
    { name: 'Iodized Salt (1kg)', category: 'sugar_salt', unit: 'kg', costPrice: 15, sellingPrice: 22, quantity: 500, lowStockThreshold: 50, supplier: suppliers[3]._id },
    { name: 'Poha (Flattened Rice)', category: 'grains', unit: 'kg', costPrice: 45, sellingPrice: 58, quantity: 120, lowStockThreshold: 15, supplier: suppliers[0]._id, expiryDate: expiryFuture(200) },
    { name: 'Vermicelli (Seviyan)', category: 'packaged', unit: 'packets', costPrice: 25, sellingPrice: 35, quantity: 200, lowStockThreshold: 30, supplier: suppliers[3]._id, expiryDate: expiryFuture(60) },
    { name: 'Maida (Refined Flour)', category: 'flour', unit: 'kg', costPrice: 30, sellingPrice: 40, quantity: 0, lowStockThreshold: 30, supplier: suppliers[0]._id, gstRate: 0 },
  ]);
  console.log('✅ Products created');

  // Stock transactions (past 30 days)
  const txns = [];
  for (let i = 0; i < products.length; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const txDate = new Date();
    txDate.setDate(txDate.getDate() - daysAgo);
    txns.push({
      product: products[i]._id,
      type: 'stock_in',
      quantity: products[i].quantity || 50,
      previousQty: 0,
      newQty: products[i].quantity,
      unitPrice: products[i].costPrice,
      totalValue: products[i].quantity * products[i].costPrice,
      reason: 'Initial Stock',
      performedBy: admin._id,
      createdAt: txDate,
    });
  }
  await StockTransaction.insertMany(txns);
  console.log('✅ Stock transactions created');

  // Sales (past 30 days)
  const sales = [];
  for (let day = 29; day >= 0; day--) {
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - day);
    saleDate.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);

    const numSales = Math.floor(Math.random() * 4) + 2;
    for (let s = 0; s < numSales; s++) {
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0, totalCost = 0;
      const usedProducts = new Set();

      for (let i = 0; i < itemCount; i++) {
        let p;
        do { p = products[Math.floor(Math.random() * products.length)]; } while (usedProducts.has(p._id.toString()));
        usedProducts.add(p._id.toString());
        const qty = Math.floor(Math.random() * 10) + 1;
        const total = qty * p.sellingPrice;
        subtotal += total;
        totalCost += qty * p.costPrice;
        items.push({ product: p._id, productName: p.name, quantity: qty, unitPrice: p.sellingPrice, costPrice: p.costPrice, gstRate: p.gstRate || 5, total });
      }

      const totalGst = (subtotal * 0.05);
      sales.push({
        items,
        subtotal,
        totalGst,
        totalAmount: subtotal + totalGst,
        totalCost,
        profit: subtotal - totalCost,
        paymentMode: ['cash', 'upi', 'credit'][Math.floor(Math.random() * 3)],
        performedBy: Math.random() > 0.5 ? admin._id : staff._id,
        createdAt: saleDate,
      });
    }
  }
  await Sale.insertMany(sales);
  console.log('✅ Sales data created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('👤 Admin:  admin@aadishtraders.com / Admin@123');
  console.log('👤 Staff:  staff@aadishtraders.com / Staff@123\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
