const express = require('express');
const addressController = require('../controllers/addressController');
const authController = require('../controllers/authController');

const router = express.Router();
//no authorization needed at this point
//after this point all router need authorization
router.use(authController.protect);
router
    .route('/myAddresses')
    .get(addressController.getMyAdresses)
    .post(addressController.attatchUserToBody, addressController.createAddress);

router
    .route('/myAddresses/:id')
    .patch(
        addressController.checkUserOwnsAddress,
        addressController.updateAddress
    )
    .delete(
        addressController.checkUserOwnsAddress,
        addressController.deleteAddress
    );

//after this point all router require admin role
router.use(authController.restrictTo('admin'));

router
    .route('/:id')
    .get(addressController.getAddressById)
    .patch(addressController.updateAddress);
router.route('/').get(addressController.getAllAddresses);

module.exports = router;
