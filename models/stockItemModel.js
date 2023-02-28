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
stockItemSchema.statics.setProductAttributeList = async function (productId) {
    const colorList = await this.aggregate([
        {
            $match: {
                product: productId,
            },
        },
        {
            // group by tourId so that stats of all docs containing this id are grouped
            $group: {
                _id: '$color',
            },
        },
    ]);
    const colors = colorList.map((el) => {
        return el['_id'];
    });

    await Product.findByIdAndUpdate(productId, {
        colors: colors,
    });
};
/////////////// Document middleware .save,.create
//TODO : Adding stock item adds to colors and sizes list
//TODO : deleting product deletes stock item
//////////////
//////////////////////////////////
stockItemSchema.pre('save', function (next) {
    this.color = this.color.toUpperCase();
    this.size = this.size.toUpperCase();
    next();
});
stockItemSchema.post('save', function (doc) {
    //doc.constructor calls the model cunstructor to use the static method
    // post middleware takes doc as input, use it to get the model
    doc.constructor.setProductAttributeList(doc.product);
});
////////////////////////////////////////////////////////////////
stockItemSchema.pre(/^findOneAnd/, function (next) {
    next();
});
const StockItem = mongoose.model('StockItem', stockItemSchema);
module.exports = StockItem;
