const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
//TODO:reorganize authorization
const router = express.Router({
    mergeParams: true,
});
router.use(authController.protect);
router
    .route('/')
    .get(reviewController.setProductAndUser, reviewController.getAllReviews)
    .post(reviewController.setProductAndUser, reviewController.createReview);
router.use(authController.restrictTo('user', 'admin'));
router
    .route('/:id')
    .get(reviewController.getReviewById)
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview);

module.exports = router;
