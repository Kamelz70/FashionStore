const express = require('express');
const orderItemController = require('../controllers/orderItemController');
const authController = require('../controllers/authController');
//TODO:create router
const router = express.Router();
//no authorization needed at this point

//after this point all router need authorization
router.use(authController.protect);
router
    .route('/:id')
    .patch(orderItemController.getMyAdresses)
    .post(
        orderItemController.attatchUserToBody,
        orderItemController.createOrderItem
    );

//after this point all router require admin role
router.use(authController.restrictTo('admin'));

module.exports = router;
