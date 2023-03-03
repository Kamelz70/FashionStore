const mongoose = require('mongoose');
const User = require('./userModel');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StockItem = require('./stockItemModel');

const cartSchema = new mongoose.Schema({
    cartItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
        },
    ],
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
        validate: {
            validator: async function (value) {
                const user = await User.findById(value);
                if (!user) {
                    return false;
                }
                return true;
            },
            message: "user id doesn't exist",
        },
    },
});
/////////////// Document middleware .save,.create

//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
