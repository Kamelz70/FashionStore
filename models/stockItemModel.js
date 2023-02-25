const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Product = require('./productModel');

const stockItemSchema = new mongoose.Schema({
    //amount: virtual
    quantity: {
        type: Number,
        default: 1,
        min: 0,
        max: 200000,
    },
    size: String,
    color: String,
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'A stock item must have a product parent'],
        validate: {
            validator: async function (value) {
                const prod = await Product.findById(value);
                if (!prod) {
                    return false;
                }
                return true;
            },
            message: "product id doesn't exist",
        },
    },
    price: {
        type: Number,
        min: 0,
        max: 200000,
    },
});
/////////////// Document middleware .save,.create
//TODO : Adding same stock item increases quantity
//TODO : Adding stock item adds to colors and sizes list
//TODO : deleting product deletes stock item
//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const StockItem = mongoose.model('StockItem', stockItemSchema);
module.exports = StockItem;
