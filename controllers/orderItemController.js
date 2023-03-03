const catchAsync = require('../utils/catchAsync');
const OrderItem = require('../models/orderItemModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');

/////////////////////////////
// req controllers

exports.updateOrderItem = handlerFactory.updateOne(OrderItem);
exports.deleteOrderItem = handlerFactory.deleteOne(OrderItem);
// exports.getOrderItem = handlerFactory.getOne(OrderItem);
