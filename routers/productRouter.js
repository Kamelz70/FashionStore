const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();
//no authorization needed at this point
router.route('/').get(productController.getAllProducts);
router.route('/:id').get(productController.getProduct);
//after this point all router need authorization
router.use(authController.protect);

//after this point all router require admin role
router.use(authController.restrictTo('admin'));

router.route('/').post(productController.createProduct);

router
    .route('/:id')
    .patch(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
