const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StockItem = require('./stockItemModel');
const Product = require('./productModel');
const AppError = require('../utils/appError');
//TODO:only pass stockItem id and quantity
const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        min: 1,
        default: 1,
        max: 100,
    },
    pricePerItem: {
        type: Number,
        required: [true, 'an orderItem must have a pricePerItem'],
        min: 0,
        max: 200000,
    },
    totalAmount: {
        type: Number,
        required: [true, 'an orderItem must have a totalAmount'],
        min: 0,
        max: 200000,
    },
    stockItem: {
        type: new mongoose.Schema({
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: [true, 'A stickItem parent must have an id'],
            },
            size: { type: String, uppercase: true },
            color: { type: String, uppercase: true },
        }),
        required: [true, 'An Order Item must have a stockItem parent'],
    },
    product: {
        type: new mongoose.Schema({
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: [true, 'A product parent must have an id'],
            },
            title: {
                type: String,
                required: [true, 'A product must have a title'],
                trim: true,
            },
            model: {
                type: String,
                // required: [true, 'A product must have a title'],
                unique: true,
                uppercase: true,
                trim: true,
            },
            description: {
                type: String,
                trim: true,
                // required: [true, 'A product must have a description'],
            },
            createdAt: { type: Date, required: true },
        }),
        required: [true, 'An Order Item must have a product parent'],
    },
});
/////////////// Document middleware .save,.create
orderItemSchema.pre('save', async function (next) {
    //if item isn't new, don't validate

    //validate stockItem
    const stockItem = await StockItem.findById(this.stockItem.id);
    if (!stockItem) {
        return next(new AppError("stockItem parent id doesn't exist", 404));
    }
    //validate product
    const product = await Product.findById(stockItem.product);
    if (!product) {
        return next(new AppError("product parent id doesn't exist", 404));
    }
    //check stock if empty
    if (stockItem.quantity < 1) {
        return next(
            new AppError(
                `Can't add item,no items left in stock
        `,
                409
            )
        );
    }
    // check if new quatity is larger than stock
    if (stockItem.quantity < this.quantity) {
        // set quantity same as stock
        this.quantity = stockItem.quantity;
    }
    //set fields
    this.pricePerItem = stockItem.price || product.price;
    this.stockItem = stockItem;
    this.product = product;
    this.totalAmount = this.quantity * this.pricePerItem;
});
//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;
