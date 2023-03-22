const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Product = require('./productModel');
const AppError = require('../utils/appError');
///////////////////////////     Schema
const stockItemSchema = new mongoose.Schema({
    //amount: virtual
    quantity: {
        type: Number,
        default: 1,
        min: 0,
        max: 200000,
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
///////////////////////////     middleqare

stockItemSchema.index({
    product: 1,
});
// Deleting a stockItem deletes its' ID from product parent
stockItemSchema.pre(/([D|d]elete|[r]emove)/, async function (next) {
    // query middleware getQuery gets query
    const thisDoc = await StockItem.findOne(this.getQuery());
    //TODO:check if delete gets back a stock item with find
    if (!thisDoc) {
        return next();
    }
    const productAttribueList =
        await thisDoc.constructor.setProductAttributeList(
            thisDoc.product,
            'colors',
            'sizes'
        );
    const stockItemList = await thisDoc.constructor.setProductStockItemList(
        thisDoc.product
    );
    // set stockItems in product
    productAttribueList.stockItems = stockItemList;
    await Product.findByIdAndUpdate(thisDoc.product, productAttribueList);
    //TODO:delete stockItem from carts
    next();
});
////////////////////////////////////////////////////////////////
//TODO:check if this runs on delete
stockItemSchema.post(/(^findOneAnd|save)/, async function (doc) {
    if (!doc) {
        return;
    }
    const productAttribueList = await doc.constructor.setProductAttributeList(
        doc.product,
        'colors',
        'sizes'
    );
    const stockItemList = await doc.constructor.setProductStockItemList(
        doc.product
    );
    // set stockItems in product
    productAttribueList.stockItems = stockItemList;
    await Product.findByIdAndUpdate(doc.product, productAttribueList);
    //TODO:edit stockItem in carts
});

const StockItem = mongoose.model('StockItem', stockItemSchema);
module.exports = StockItem;
