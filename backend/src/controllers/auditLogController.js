const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, entity, userId, startDate, endDate } = req.query;
  const query = {};
  if (entity) query.entity = entity;
  if (userId) query.performedBy = userId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('performedBy', 'name email role'),
    AuditLog.countDocuments(query),
  ]);
  res.json({ success: true, data: logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

module.exports = { getAuditLogs };
