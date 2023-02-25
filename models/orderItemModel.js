const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const oderItemSchema = new mongoose.Schema({
    cartItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
        },
    ],
    amount: {
        type: Number,
        required: [true, 'An Order Item must have an amount'],
        min: 0,
        max: 200000,
    },
    quantity: {
        type: Number,
        ref: 'OrderItem',
        min: 0,
        default: 1,
        max: 100,
    },
    size: String,
    color: String,
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
});
/////////////// Document middleware .save,.create

//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const OderItem = mongoose.model('OderItem', cartSchema);
module.exports = OderItem;
