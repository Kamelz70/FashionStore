const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const Product = require('./productModel');

//review,rating,createdAt,ref:Tour,Ref:User
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must have text'],
    },
    rating: {
        type: Number,
        required: [true, 'A review must have a rating'],
        min: 0,
        max: 5,
    },
    createdAt: {
        type: Date,
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'A review must have a referenced product'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must have a referenced user'],
    },
});
///////////////////////////////////////////////////
//indexes
// meaning no user can rate a product multiple times
reviewSchema.index(
    {
        product: 1,
        user: 1,
    },
    {
        unique: true,
    }
);
///////////////////////////////////////////////////
// Static methods (unlike instance methods)
reviewSchema.statics.calcAverageRatingsOnProduct = async function (productId) {
    // this refers to this Model
    const stats = await this.aggregate([
        {
            $match: {
                product: productId,
            },
        },
        {
            // group by tourId so that stats of all docs containing this id are grouped
            $group: {
                _id: '$product',
                averageRating: {
                    $avg: '$rating',
                },
                nRatings: {
                    $sum: 1,
                },
            },
        },
    ]);
    //update product rating
    await Product.findByIdAndUpdate(productId, {
        ratingsAverage: stats.length > 0 ? stats[0].averageRating : 0,
        ratingsQuantity: stats.length > 0 ? stats[0].nRatings : 0,
    });
};
/////////////// Document middleware
reviewSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = Date.now();
        //validate if product can be reviewed
        //1)get orders of user and product
        // const order = Order.findOne({ product });
    }
    next();
});
// post for after the review is saved, avg is calculated
reviewSchema.post('save', async (doc) => {
    //doc.constructor calls the model cunstructor to use the static method
    // post middleware takes doc as input, use it to get the model
    doc.constructor.calcAverageRatingsOnProduct(doc.product);
});
////////////// query middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        //TODO: add photo to select
        select: 'name',
    });
    next();
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
    console.log(this.getQuery());

    const review = await Review.findOne(this.getQuery());
    if (!review) {
        return next(new AppError('review ID not found', 404));
    }
    console.log(review);
    this.Review = review;
    next();
});
reviewSchema.post(/^findOneAnd/, async function () {
    console.log(this.Review);
    await Review.calcAverageRatingsOnProduct(this.Review.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
