const router = require('express').Router();
const { exportReport } = require('../controllers/reportController');

router.get('/export', exportReport);

module.exports = router;
