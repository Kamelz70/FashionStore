const mongoose = require('mongoose');
const OrderItem = require('./orderItemModel');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cartSchema = new mongoose.Schema({
    cartItems: [{ type: OrderItem.schema, default: [] }],
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum amount is 1'],
        max: [200000, 'Maximum rating is 200000'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // validate: {
        //     validator: async function (value) {
        //         // if no mods done to user, return
        //         if (!this.isModified('user')) {
        //             return true;
        //         }
        //         // else check user
        //         const user = await User.findById(value);
        //         if (!user) {
        //             return false;
        //         }
        //         return true;
        //     },
        //     message: "user id doesn't exist",
        // },
    },
});
/////////////// Document middleware .save,.create
cartSchema.pre('save', async function (next) {
    //if item isn't new, don't validate
    this.totalAmount = 0;
    this.cartItems.forEach((item) => {
        this.totalAmount += item.totalAmount;
    });
    next();
});
//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
