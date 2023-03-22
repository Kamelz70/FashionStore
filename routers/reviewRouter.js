const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({
    mergeParams: true,
});
//no authentication needed for get
router.get(
    '/',
    //middleware if nested route
    reviewController.setProductAndUser,
    reviewController.getAllReviews
);
router.use(authController.protect);
router.post(
    '/',
    reviewController.setProductAndUser,
    reviewController.createReview
);
// make review editible by owner only and deletible by admin and owner(in model)
router
    .route('/:id')
    .get(reviewController.verifyOwner, reviewController.getReviewById)
    .delete(reviewController.verifyOwner, reviewController.deleteReview)
    .patch(reviewController.verifyOwner, reviewController.updateReview);

module.exports = router;
