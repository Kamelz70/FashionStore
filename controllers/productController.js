const catchAsync = require('../utils/catchAsync');
const Product = require('../models/productModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');
exports.createProduct = handlerFactory.createOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product);
exports.deleteProduct = handlerFactory.deleteOne(Product);
exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product);
exports.searchProducts = catchAsync(async (req, res, next) => {
    // features = new APIFeatures(
    //     Product.find({
    //         $text: { $search: req.query.searchText, caseSensetive: false },
    //     }).Aggregate({ $project: { score: { $meta: 'textScore' } } }),
    //     req.query
    // )
    //     .filter()
    //     .paginate()
    //     .sort()
    //     .limitFields();
    // const products = await features.query;
    if (!req.query.searchText) {
        req.query.searchText = '';
        return res.status(200).json({
            status: 'success',
            requetedAt: res.requestTime,
            data: {
                products: [],
            },
        });
    }

    const products = await Product.aggregate([
        {
            $match: {
                $text: { $search: req.query.searchText },
            },
        },

        { $addFields: { score: { $meta: 'textScore' } } },
    ]).sort('-score');

    return res.status(200).json({
        status: 'success',
        requetedAt: res.requestTime,
        results: products.length,
        data: {
            products,
        },
    });
});
