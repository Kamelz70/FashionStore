const express = require('express');
const orderItemController = require('../controllers/orderItemController');
const authController = require('../controllers/authController');

const router = express.Router();
//no authorization needed at this point

//after this point all router need authorization
router.use(authController.protect);

//after this point all router require admin role
router.use(authController.restrictTo('admin'));

module.exports = router;
