const catchAsync = require('../utils/catchAsync');
const Product = require('../models/productModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createProduct = handlerFactory.createOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product);
exports.deleteProduct = handlerFactory.deleteOne(Product);
exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product);
