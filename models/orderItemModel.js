const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StockItem = require('./stockItemModel');
const Product = require('./productModel');
//TODO:remodel
const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        min: 1,
        default: 1,
        max: 100,
    },
    stockItem: {
        type: StockItem.schema,
        validate: {
            validator: async function (value) {
                // if no mods done to stockItem, return
                if (!this.isModified('stockItem')) {
                    return true;
                }
                // else check stockItem
                const stockItem = await StockItem.findById(value.id);
                if (!stockItem) {
                    return false;
                }
                return true;
            },
            message: "stockItem id doesn't exist",
            required: [true, 'An Order Item must have a stockItem parent'],
        },
    },
    product: {
        type: Product.schema,
        required: [true, 'An Order Item must have a product parent'],
        validate: {
            validator: async function (value) {
                // if no mods done to product, return
                if (!this.isModified('product')) {
                    return true;
                }
                // else check product
                const product = await Product.findById(value.id);
                if (!product) {
                    return false;
                }
                return true;
            },
            message: "product id doesn't exist",
            required: [true, 'An Order Item must have a product parent'],
        },
    },
});
/////////////// Document middleware .save,.create

//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const OderItem = mongoose.model('OderItem', orderItemSchema);
module.exports = OderItem;
