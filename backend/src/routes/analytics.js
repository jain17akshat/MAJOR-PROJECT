const router = require('express').Router();
const { getDashboard, getTrends, getTopProducts, getSlowMoving, getCategoryBreakdown, getRestockSuggestions } = require('../controllers/analyticsController');

router.get('/dashboard', getDashboard);
router.get('/trends', getTrends);
router.get('/top-products', getTopProducts);
router.get('/slow-moving', getSlowMoving);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/restock-suggestions', getRestockSuggestions);

module.exports = router;
