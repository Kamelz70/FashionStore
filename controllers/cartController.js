const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getAllCarts = handlerFactory.getAll(Cart);
exports.getCart = handlerFactory.getOne(Cart);
exports.getMyCart = catchAsync(async (req, res, next) => {
    //use protect middleware in router to access user

    console.log(req.user);
    const cart = await Cart.findById(req.user.cart);
    if (!cart) {
        return next(new AppError('no cart with such ID found', 404));
    }

    res.status(200).json({ status: 'success', data: cart });
});
