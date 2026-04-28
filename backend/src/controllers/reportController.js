const exportService = require('../services/exportService');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/reports/export?type=products|sales|transactions&format=xlsx|csv
const exportReport = asyncHandler(async (req, res) => {
  const { type = 'products', format = 'xlsx', startDate, endDate } = req.query;
  const { buffer, filename, contentType } = await exportService.generateReport(type, format, { startDate, endDate });
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = { exportReport };
