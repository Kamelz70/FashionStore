const express = require('express');
const collectionController = require('../controllers/collectionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(collectionController.getAllCollections);
router.route('/:id').get(collectionController.getPopulatedCollection);

router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.route('/').post(collectionController.createCollection);
router
    .route('/:id')
    .post(collectionController.addProductsToCollection)
    .patch(collectionController.updateCollection);

module.exports = router;
