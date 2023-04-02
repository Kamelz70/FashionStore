const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StockItem = require('./stockItemModel');
const Product = require('./productModel');
const Address = require('./addressModel');
const OrderItem = require('./orderItemModel');
const User = require('./userModel');
const Cart = require('./cartModel');
const Payment = require('./paymentModel');
const orderSchema = new mongoose.Schema({
    totalOrderAmount: {
        type: Number,
        min: 0,
        max: 200000,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'An order must have a user owner'],
    },
    //validate if address exists in user addresses
    address: {
        type: Address.schema,
        required: [true, 'An order must have an address'],
        validate: {
            validator: async function (value) {
                // else check address
                const user = await User.findById(this.user).select('addresses');

                if (!user.addresses.includes(value.id)) {
                    return false;
                }
                return true;
            },
            message: "address doesn't belong to user",
        },
        required: [true, 'An Order must have an address'],
    },
    createdAt: { type: Date, default: Date.now() },
    phoneNumber: {
        type: String,
    },
    orderStatus: {
        type: String,
        trim: true,
        enum: ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'new',
    },
    orderItems: [
        {
            type: OrderItem.schema,
            //many Validators
            validate:
                //validate if stockItem still exists
                {
                    validator: async function (item) {
                        // optimise to find stock item once
                        const stockItem = await StockItem.findById(
                            item.stockItem.id
                        );
                        if (item.quantity > stockItem.quantity) {
                            return false;
                        }
                        return true;
                    },
                    message: 'ordered quantity is more than stock ',
                },
        },
    ],
    payment: {
        type: Payment.schema,
    },
});
orderSchema.pre('save', async function (next) {
    //to check in post middleware if it's new
    // this.wasNew = this.isNew;

    //TODO:runvalidators not working, unsafe operation
    if (this.isNew) {
        //set order date and payment
        this.createdAt = Date.now();
        //set order amount
        // ////////
        let amount = 0;
        this.orderItems.forEach((item) => {
            amount += item.totalAmount;
        });
        this.totalOrderAmount = amount;
        // ////////
        if (!this.payment) {
            this.payment = new Payment();
        }
        this.payment.amount = amount;
        this.payment.user = this.user;

        //set stockItem quantity
        for (item in this.orderItems) {
            const stockItem = await StockItem.findByIdAndUpdate(
                this.orderItems[item].stockItem.id,
                { $inc: { quantity: -this.orderItems[item].quantity } },
                { new: true, runValidators: true }
            );
            console.log('stockItem:', stockItem);
        }
        // get user and populate cart id
        const user = await User.findById(this.user).select('cart');
        //empty user cart
        // await Cart.findByIdAndUpdate(user.cart, { cartItems: [] });
    }
    next();
});
//////////////
//FIXME:adding an available item when there's an empty another doen't work
// orderSchema.post('save', async function (doc) {});
//////////////////////////////////

////////////////////////////////////////////////////////////////

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
