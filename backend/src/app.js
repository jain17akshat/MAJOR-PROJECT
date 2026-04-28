const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', rateLimiter, require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

app.get('/api/health', (req, res) =>
  res.json({ success: true, service: 'Aadish Traders IMS', status: 'running' })
);

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);
app.use(errorHandler);

module.exports = app;
