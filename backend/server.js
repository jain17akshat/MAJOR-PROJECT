require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const cron = require('node-cron');
const alertService = require('./src/services/alertService');

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Aadish Traders IMS Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API: http://localhost:${PORT}/api\n`);
  });

  // Daily cron: check expiry and low stock at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily expiry & low-stock checks...');
    try {
      await alertService.checkExpiryAlerts();
      await alertService.checkLowStockAlerts();
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
