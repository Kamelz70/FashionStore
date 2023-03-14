const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
const StockItem = require('../models/stockItemModel');
const Product = require('../models/productModel');
const OrderItem = require('../models/orderItemModel');

exports.getAllCarts = handlerFactory.getAll(Cart);
exports.getCart = handlerFactory.getOne(Cart);
exports.getMyCart = catchAsync(async (req, res, next) => {
    //use protect middleware in router to access user

    const cart = await Cart.findById(req.user.cart);
    if (!cart) {
        return next(new AppError('no cart with such ID found', 404));
    }

    res.status(200).json({ status: 'success', data: cart });
});
//TODO:check with middleware if stockItem exists in body for faster performance on wrong reqs
exports.addItemToCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findById(req.user.cart);
    //if cart not found
    if (!cart) {
        return next(new AppError('cart ID not found', 404));
    }
    const stockItem = await StockItem.findById(req.body.stockItem);
    //check if stockItem id exists
    if (!stockItem) {
        return next(new AppError('stock item ID not found', 404));
    }
    //check if stock is empty (done pre save in model)

    const product = await Product.findById(stockItem.product);
    if (!product) {
        return next(new AppError('product ID not found', 404));
    }
    // check if req.body.stockItem exists
    //if item already exists in cart
    for (const item in cart.cartItems) {
        if (cart.cartItems[item].stockItem.id == req.body.stockItem) {
            cart.cartItems[item].stockItem = stockItem;
            // if req.body has a quantity field, edit
            // TODO:check if quantity is a number
            if (req.body.quantity) {
                cart.cartItems[item].quantity = req.body.quantity;
            } else {
                cart.cartItems[item].quantity++;
            }
            //else save new quantity
            await cart.save({ validateBeforeSave: false });
            return res.status(200).json({ status: 'success', data: cart });
        }
    }

    // else create new orderItem
    const orderItem = new OrderItem({
        stockItem: { _id: stockItem.id },
        quantity: req.body.quantity || 1,
    });

    cart.cartItems.push(orderItem);
    await cart.save({ validateBeforeSave: false });
    res.status(201).json({ status: 'success', data: cart });
    // use cartID, orderID,
});

exports.emptyCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.user.cart);
    //if cart not found
    if (!cart) {
        return next(new AppError('cart ID not found', 404));
    }

    cart.cartItems = [];
    await cart.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', data: cart });
    // use cartID, orderID,
});
