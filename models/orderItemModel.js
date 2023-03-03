const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StockItem = require('./stockItemModel');
// TODO :create the model
const oderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        min: 0,
        default: 1,
        max: 100,
    },
    stockItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stockItem',
        required: [true, 'An Order Item must have a stock item parent'],
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'An Order Item must have a product parent'],
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
});
/////////////// Document middleware .save,.create

//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const OderItem = mongoose.model('OderItem', cartSchema);
module.exports = OderItem;
