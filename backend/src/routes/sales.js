const router = require('express').Router();
const { createSale, getSales, getSale } = require('../controllers/saleController');

router.get('/', getSales);
router.get('/:id', getSale);
router.post('/', createSale);

module.exports = router;
