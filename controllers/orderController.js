const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
const StockItem = require('../models/stockItemModel');
const Product = require('../models/productModel');
const OrderItem = require('../models/orderItemModel');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');

exports.getAllOrders = handlerFactory.getAll(Order);
exports.getOrder = handlerFactory.getOne(Order);
exports.getMyOrders = catchAsync(async (req, res, next) => {
    //use protect middleware in router to access user

    console.log(req.user);
    const orders = await Order.find({ user: req.user.id });

    res.status(200).json({ status: 'success', data: orders });
});
//TODO:create place order
exports.placeOrder = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.user.cart);
    //if cart not found
    if (!cart) {
        return next(new AppError('cart ID not found', 404));
    }
    console.log('cartItems', !cart.cartItems);
    if (cart.cartItems.length == 0) {
        return next(new AppError('cart has no Items', 404));
    }
    //ckeck if user owns address (done in Model)
    //check if quantity is valid (done in model validate)

    //Check phone Num
    //TODO:implement coupons
    let totalOrderAmount = 0;
    //calculate total amount
    for (const item in cart.cartItems) {
        totalOrderAmount +=
            (cart.cartItems[item].stockItem.price ||
                cart.cartItems[item].product.price) *
            cart.cartItems[item].quantity;
    }
    const address = await Address.findById(req.body.address);
    if (!address) {
        return next(new AppError('address not found', 404));
    }
    const order = await Order.create({
        user: req.user.id,
        orderItems: cart.cartItems,
        address: address,
        totalAmount: totalOrderAmount,
    });
    if (!order) {
        return next(new AppError("Order couldn't be created", 505));
    }
    res.status(201).json({ status: 'success', data: order });
    // use cartID, orderID,
});
