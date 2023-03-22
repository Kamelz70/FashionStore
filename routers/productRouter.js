const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routers/reviewRouter');

const router = express.Router();

router.use('/:productID/reviews', reviewRouter);
// router.route("/:tourID/reviews").post(authController.protect, authController.restrictTo("user"), reviewController.createReview);

//no authorization needed at this point
router.route('/').get(productController.getAllProducts);

// search has to be on top to avoid confusion with /:id
router.route('/search').get(productController.searchProducts);
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
