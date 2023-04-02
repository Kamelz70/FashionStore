const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
const Collection = require('../models/collectionModel');
const Product = require('../models/productModel');
///////////////////////////////// Middleware

///////////////////////////////// request handlers
exports.getAllCollections = handlerFactory.getAll(Collection);
exports.getPopulatedCollection = handlerFactory.getOne(Collection, 'products');
exports.createCollection = handlerFactory.createOne(Collection);
exports.updateCollection = handlerFactory.updateOne(Collection);

exports.addProductsToCollection = catchAsync(async (req, res, next) => {
    // for (productIndex in req.body.products) {
    const collection = await Collection.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { products: req.body.products } },
        { new: true, runValidators: true }
    );

    if (!collection) {
        return next(new AppError("couldn't add product to collection", 500));
    }
    res.status(200).json({ status: 'success', data: collection });
    // use collectionID, orderID,
});
