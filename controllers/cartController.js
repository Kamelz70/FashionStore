const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
const StockItem = require('../models/stockItemModel');
const Product = require('../models/productModel');
const OrderItem = require('../models/orderItemModel');
///////////////////////////////// Middleware
exports.checkZeroQuantityAndSetCart = catchAsync(async (req, res, next) => {
    req.cart = await Cart.findById(req.user.cart);
    if (!req.cart) {
        return next(new AppError('cart ID not found', 404));
    }
    // if no quantity specified, continue to add item
    if (!req.body.quantity) {
        return next();
    }
    //if quantity isn't a number, retuen error
    if (isNaN(req.body.quantity)) {
        return next(new AppError("specified quantity isn't a number", 400));
    }
    if (req.body.quantity > 0) {
        //if request quantity is more than one, next and don't remove item
        return next();
    }

    //check where item is and remove it from cart
    for (const itemIndex in req.cart.cartItems) {
        if (req.cart.cartItems[itemIndex].stockItem.id == req.body.stockItem) {
            req.cart.cartItems.splice(itemIndex, 1);
            await req.cart.save();
            return res.status(200).json({ status: 'success', data: req.cart });
        }
    }
    //do nothing and respond if item isn't found
    return res.status(200).json({ status: 'success', data: req.cart });
});
///////////////////////////////// request handlers
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

exports.addItemToCart = catchAsync(async (req, res, next) => {
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
    for (const item in req.cart.cartItems) {
        if (req.cart.cartItems[item].stockItem.id == req.body.stockItem) {
            req.cart.cartItems[item].stockItem = stockItem;
            // if req.body has a quantity field, edit
            if (req.body.quantity) {
                req.cart.cartItems[item].quantity = req.body.quantity;
            } else {
                req.cart.cartItems[item].quantity++;
            }
            //else save new quantity
            await req.cart.save();
            return res.status(200).json({ status: 'success', data: req.cart });
        }
    }

    // else create new orderItem
    const orderItem = new OrderItem({
        stockItem: { _id: stockItem.id },
        quantity: req.body.quantity || 1,
    });
    req.cart.cartItems.push(orderItem);
    await req.cart.save();
    res.status(201).json({ status: 'success', data: req.cart });
    // use cartID, orderID,
});

exports.emptyCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.user.cart);
    //if cart not found
    if (!cart) {
        return next(new AppError('cart ID not found', 404));
    }

    cart.cartItems = [];
    await cart.save();
    res.status(200).json({ status: 'success', data: cart });
    // use cartID, orderID,
});
