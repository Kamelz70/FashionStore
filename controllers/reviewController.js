const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
// const catchAsync = require("../utils/catchAsync");
//////////////////////////////////////////////////////////////////////////
// MiddleWare:
exports.setProductAndUser = (req, res, next) => {
    if (!req.body.product) {
        req.body.product = req.params.productID;
    }
    if (!req.body.user && req.user) {
        req.body.user = req.user.id;
    }
    next();
};

exports.verifyOwner = catchAsync(async (req, res, next) => {
    let reviewUser = await Review.findById(req.params.id).select('user');
    if (!reviewUser) {
        return next(new AppError('review not found'), 404);
    }
    reviewUser = reviewUser['user'].id;

    if (!(req.user.id === reviewUser)) {
        return next(
            new AppError("current user isn't the owner of this review", 403)
        );
    }
    next();
});

//////////////////////////////////////////////////////////////////////
// Req Handlers

exports.getAllReviews = handlerFactory.getAll(Review);
exports.getReviewById = handlerFactory.getOne(Review);
exports.createReview = handlerFactory.createOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
