const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

const staffOrAdmin = (req, res, next) => {
  if (req.user && ['admin', 'staff'].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: 'Access denied.' });
};

module.exports = { adminOnly, staffOrAdmin };
