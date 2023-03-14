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
});
orderSchema.pre('save', async function (next) {
    //to check in post middleware if it's new
    this.wasNew = this.isNew;
    //set order date
    console.log('pre save order');
    if (this.isNew) {
        this.createdAt = Date.now();
    }
    let amount = 0;
    //set order amount
    this.orderItems.forEach((item) => {
        amount += item.totalAmount;
    });
    this.totalOrderAmount = amount;
    console.log('total order amount:', amount);

    next();
});
//////////////
//FIXME:adding an available item when there's an empty another doen't work
orderSchema.post('save', async function (doc) {
    if (doc.wasNew) {
        //set stockItem quantity
        for (item in doc.orderItems) {
            const stockItem = await StockItem.findById(
                doc.orderItems[item].stockItem.id
            );
            //minus order item quantity
            stockItem.quantity -= doc.orderItems[item].quantity;
            stockItem.save({ validateBeforeSave: false });
        }
        //empty user cart
        // get user and populate cart id
        const user = await User.findById(doc.user).select('cart');
        //save cart in an object
        await Cart.findByIdAndUpdate(user.cart, { cartItems: [] });
    }
});
//////////////////////////////////

////////////////////////////////////////////////////////////////

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
