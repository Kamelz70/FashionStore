const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const productSchema = new mongoose.Schema({
    //amount: virtual
    title: {
        type: String,
        required: [true, 'A product must have a title'],
        // unique: true,
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

    sizes: [{ type: String, uppercase: true, trim: true }],
    colors: [{ type: String, uppercase: true, trim: true }],
    stockItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StockItem',
        },
    ],
    price: {
        type: Number,
        required: [true, 'A product must have a price'],
        min: 0,
        max: 200000,
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [1, 'minimum rating is 1'],
        max: [5, 'maximum rating is 5'],
        set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
        min: 0,
        max: [200000, 'Product price cannot exceed 200000 pounds'],
    },
    createdAt: { type: Date, default: Date.now() },
});
/////////////// Document middleware .save,.create

productSchema.index({
    title: 'text',
    description: 'text',
    model: 'text',
    colors: 'text',
});
//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////
// stockItemSchema.pre(/delete/, function (next) {
//     console.log('deleting');
//     this.stockItems()
//     next();
// });
const StockItem = mongoose.model('Product', productSchema);
module.exports = StockItem;
