const express = require('express');
const stockItemController = require('../controllers/stockItemController');
const authController = require('../controllers/authController');

const router = express.Router();
// middleware to capitalize fields of item
// router.use(stockItemController.capitalizeFields('color', 'size', 'model'));

//no authorization needed at this point
router.route('/:id').get(stockItemController.getStockItem);
//after this point all router need authorization
router.use(authController.protect);

//after this point all router require admin role
router.use(authController.restrictTo('admin'));

router.route('/').get(stockItemController.getAllStockItems);
router.route('/').post(stockItemController.createStockItem);

router
    .route('/:id')
    .patch(stockItemController.updateStockItem)
    .delete(stockItemController.deleteStockItem);

module.exports = router;
