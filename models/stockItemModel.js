const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Product = require('./productModel');
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
///////////////////////////     static methods

// gets fields which we will calculate its' different values in the product
stockItemSchema.statics.setProductAttributeList = async function (
    productDoc,
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
                    product: productDoc._id,
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
    //save into DB
    console.log(updateQueryValues);
    for (let key in updateQueryValues) {
        productDoc[key] = updateQueryValues[key];
    }
    return productDoc;
    // await Product.findByIdAndUpdate(productId, updateQueryValues);
};

stockItemSchema.statics.setProductStockItemList = async function (productDoc) {
    //run the pipeline to get the values
    var stockItemList = await StockItem.find({
        product: productDoc._id,
    }).select('_id');
    //remove the ids
    stockItemList = stockItemList.map((el) => {
        return el['_id'];
    });
    productDoc.stockItems = stockItemList;
    return productDoc;
    // await Product.findByIdAndUpdate(productId, updateQueryValues);
};
///////////////////////////     middleqare

///TODO: createMany crashes
///TODO: add product index

////////////////////////////////////////////////////////////////
stockItemSchema.post(/(^findOneAnd|save)/, async function (doc) {
    let productDoc = await Product.findById(doc.product);
    productDoc = await doc.constructor.setProductAttributeList(
        productDoc,
        'colors',
        'sizes'
    );
    productDoc = await doc.constructor.setProductStockItemList(productDoc);
    console.log('productDoc:    ');
    productDoc.save();
});

const StockItem = mongoose.model('StockItem', stockItemSchema);
module.exports = StockItem;
