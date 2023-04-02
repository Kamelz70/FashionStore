const mongoose = require('mongoose');
const Product = require('../models/productModel');
const collectionSchema = new mongoose.Schema({
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            validate: {
                validator: async function (value) {
                    // if no mods done to user, return
                    // else check user
                    console.log('validating');
                    const product = await Product.findById(value);
                    if (!product) {
                        return false;
                    }
                    return true;
                },
                message: "product id doesn't exist",
            },
        },
    ],
    title: { type: String, required: true, trim: true, unique: true },
    //validate if address exists in user addresses
    createdAt: { type: Date, default: Date.now() },
});
collectionSchema.pre('save', async function (next) {
    next();
});

////////////////////////////////////////////////////////////////

const Collection = mongoose.model('Collection', collectionSchema);
module.exports = Collection;
