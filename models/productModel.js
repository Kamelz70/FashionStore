const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const productSchema = new mongoose.Schema({
    //amount: virtual
    title: {
        type: String,
        required: [true, 'A product must have a title'],
        unique: true,
    },
    model: {
        type: String,
        // required: [true, 'A product must have a title'],
        unique: true,
    },
    description: {
        type: String,
        // required: [true, 'A product must have a description'],
    },

    //TODO : Add images,
    sizes: [String],
    colors: [String],
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
        default: undefined,
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
});
/////////////// Document middleware .save,.create

//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const StockItem = mongoose.model('Product', productSchema);
module.exports = StockItem;
