const AuditLog = require('../models/AuditLog');

const auditLog = (action, entity) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (body && body.success) {
      try {
        await AuditLog.create({
          action,
          entity,
          entityId: body.data?._id || req.params.id,
          entityName: body.data?.name || body.data?.productName,
          performedBy: req.user?._id,
          performedByName: req.user?.name,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          changes: req.body,
        });
      } catch (e) {
        console.error('Audit log error:', e.message);
      }
    }
    return originalJson(body);
  };
  next();
};

module.exports = { auditLog };
