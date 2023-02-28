const catchAsync = require('../utils/catchAsync');
const StockItem = require('../models/stockItemModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
////////////////////////////////
// Middleware
exports.capitalizeFields =
    (...fields) =>
    (req, res, next) => {
        fields.forEach((field) => {
            if (req.body[field])
                req.body[field] = req.body[field].toUpperCase();
        });
        next();
    };
/////////////////////////////
// req controllers
exports.createStockItem = catchAsync(async (req, res, next) => {
    // Check if stock item already exists
    existingItem = await StockItem.findOne({
        product: req.body.product,
        color: req.body.color,
        size: req.body.size,
    });
    //if item exists, only add to quantity
    if (existingItem) {
        // if req has quantity add it to existing quantity, else add 1 to existing quantity
        existingItem.quantity += req.body.quantity ? req.body.quantity : 1;
        existingItem.save();
        return res.status(200).json({ status: 'success', data: existingItem });
    }
    // create new stock item if it doesn't exist
    const doc = await StockItem.create(req.body);
    if (!doc) {
        return next(new AppError("Couldn't create document", 404));
    }
    res.status(201).json({ status: 'success', data: doc });
});
exports.updateStockItem = handlerFactory.updateOne(StockItem);
exports.deleteStockItem = handlerFactory.deleteOne(StockItem);
exports.getAllStockItems = handlerFactory.getAll(StockItem);
exports.getStockItem = handlerFactory.getOne(StockItem);
