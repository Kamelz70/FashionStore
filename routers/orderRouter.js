const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();
//no authorization needed at this point

//after this point all routes need authentication
router.use(authController.protect);
router
    .route('/myOrders')
    .get(orderController.getMyOrders)
    .post(orderController.placeOrder);

//after this point all router require admin role
router.use(authController.restrictTo('admin'));
router.route('/:id').get(orderController.getOrder);
router.route('/').get(orderController.getAllOrders);

module.exports = router;
