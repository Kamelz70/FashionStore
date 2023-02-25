const catchAsync = require('../utils/catchAsync');
const StockItem = require('../models/stockItemModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createStockItem = handlerFactory.createOne(StockItem);
exports.updateStockItem = handlerFactory.updateOne(StockItem);
exports.deleteStockItem = handlerFactory.deleteOne(StockItem);
exports.getAllStockItems = handlerFactory.getAll(StockItem);
exports.getStockItem = handlerFactory.getOne(StockItem);
