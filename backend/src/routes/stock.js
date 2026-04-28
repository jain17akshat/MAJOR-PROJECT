const router = require('express').Router();
const { stockIn, stockOut, getTransactions } = require('../controllers/stockController');

router.post('/in', stockIn);
router.post('/out', stockOut);
router.get('/transactions', getTransactions);

module.exports = router;
