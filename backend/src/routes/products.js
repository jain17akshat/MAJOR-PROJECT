const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, bulkImport, upload, getProductStats } = require('../controllers/productController');

router.get('/stats/summary', getProductStats);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.post('/bulk-import', upload.single('file'), bulkImport);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
