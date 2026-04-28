const router = require('express').Router();
const { getAuditLogs } = require('../controllers/auditLogController');

router.get('/', getAuditLogs);

module.exports = router;
