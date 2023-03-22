const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();
//no authorization needed at this point

//after this point all routes need authentication
router.use(authController.protect);
router
    .route('/myCart')
    .get(cartController.getMyCart)
    .post(
        //check if added item has zero quantity to remove is from cart
        cartController.checkZeroQuantityAndSetCart,
        cartController.addItemToCart
    )
    .delete(cartController.emptyCart);

//after this point all router require admin role
router.use(authController.restrictTo('admin'));
router.route('/:id').get(cartController.getCart);
router.route('/').get(cartController.getAllCarts);

module.exports = router;
