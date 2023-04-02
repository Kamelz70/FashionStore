const mongoose = require('mongoose');
const User = require('./userModel');
const paymentSchema = new mongoose.Schema({
    paymentType: {
        type: String,
        trim: true,
        enum: ['CashOnDelivery'],
        default: 'CashOnDelivery',
    },
    amount: {
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
                // if no mods done to user, return
                if (!this.isModified('user')) {
                    return true;
                }
                // else check user
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
paymentSchema.pre('save', async function (next) {
    next();
});
//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
