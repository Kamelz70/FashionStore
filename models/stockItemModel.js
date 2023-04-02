const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Product = require('./productModel');
const AppError = require('../utils/appError');
const Cart = require('./cartModel');
///////////////////////////     Schema
const stockItemSchema = new mongoose.Schema({
    //amount: virtual
    quantity: {
        type: Number,
        default: 1,
        min: 0,
        max: 200000,
        validate: {
            validator: async function (quantity) {
                // if no mods done to product, return

                // if (!this.isModified('quantity')) {
                //     return true;
                // }
                // else check product
                if (quantity < 0) {
                    return false;
                }
                return true;
            },
            message: "stock quantity can't be less than 0",
        },
    },
    size: { type: String, uppercase: true },
    color: { type: String, uppercase: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'A stock item must have a product parent'],
        validate: {
            validator: async function (value) {
                // if no mods done to product, return
                if (!this.isModified('product')) {
                    return true;
                }
                // else check product
                const prod = await Product.findById(value).select('_id');
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
        validate: {
            validator: async function (value) {
                // if no mods done to product, return
                if (!this.isModified('price')) {
                    return true;
                }
                // else check product
                if (quantity < 0) {
                    return false;
                }
                return true;
            },
            message: "price can't be less than 0",
        },
    },
});
///////////////////////////     static methods

// gets fields which we will calculate its' different values in the product
//returns product attributes' map
stockItemSchema.statics.setProductAttributeList = async function (
    productId,
    ...fields
) {
    //initialize the variable where we will set our values in
    var updateQueryValues = {};
    //
    for (const attribute of fields) {
        // pipeline which runs for each field
        pipeline = [
            {
                $match: {
                    product: productId,
                },
            },
            {
                //group values of field whithout the last "s"
                $group: {
                    _id: `$${attribute.substring(0, attribute.length - 1)}`,
                },
            },
        ];
        //run the pipeline to get the values
        var attributeValueList = await StockItem.aggregate(pipeline);
        //remove the ids
        attributeValueList = attributeValueList.map((el) => {
            return el['_id'];
        });
        //save in our variable
        updateQueryValues[attribute] = attributeValueList;
    }

    return updateQueryValues;
    // await Product.findByIdAndUpdate(productId, updateQueryValues);
};

//returns stockItem list for a product
stockItemSchema.statics.setProductStockItemList = async function (productId) {
    //run the pipeline to get the values
    var stockItemList = await StockItem.find({
        product: productId,
    }).select('_id');
    //remove the ids
    stockItemList = stockItemList.map((el) => {
        return el['_id'];
    });
    return stockItemList;
    // await Product.findByIdAndUpdate(productId, updateQueryValues);
};
///////////////////////////     Middleware

stockItemSchema.index({
    product: 1,
});
stockItemSchema.pre(/(^findOneAnd)/, async function (next) {
    this.thisDoc = await StockItem.findOne(this.getQuery());
    if (!this.thisDoc) {
        return next();
    }
    next();
});
////////////////////////////////////////////////////////////////
stockItemSchema.post(/(^findOneAnd|save)/, async function (doc) {
    if (!(doc || this.thisDoc)) {
        return;
    }
    doc = this.thisDoc;
    const productAttribueList = await StockItem.setProductAttributeList(
        doc.product,
        'colors',
        'sizes'
    );
    const stockItemList = await StockItem.setProductStockItemList(doc.product);
    // set stockItems in product
    productAttribueList.stockItems = stockItemList;
    await Product.findByIdAndUpdate(doc.product, productAttribueList);
    //TODO:edit stockItems in carts
    // let carts = await Cart.find({ 'cartItems.stockItem.id': doc.id });
    // let carts = await Cart.find();
    // console.log(carts);
});

const StockItem = mongoose.model('StockItem', stockItemSchema);
module.exports = StockItem;
