const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StockItem = require('./stockItemModel');
const Product = require('./productModel');
const Address = require('./addressModel');
const OrderItem = require('./orderItemModel');
const User = require('./userModel');
//TODO:remodel
const orderSchema = new mongoose.Schema({
    // TODO: make middleware set it
    totalAmount: {
        type: Number,
        min: 0,
        required: [true, 'An order must have a total amount'],
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
    //TODO:remove date from request
    date: { type: Date, default: Date.now() },
    // TODO: make phone system
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
            validate: [
                //validate if stockItem still exists
                {
                    validator: async function (item) {
                        // check stockItem quantity
                        const stockItem = await StockItem.findById(
                            item.stockItem.id
                        );
                        if (!stockItem) {
                            return false;
                        }
                        return true;
                    },
                    message: "stockItem id doesn't exist or quantity is more ",
                },
                //validate if item quantity is valid
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
                    message:
                        'stockItem quantity is less than ordered quantity ',
                },
            ],
        },
    ],
});
/////////////// Document middleware .save,.create

//////////////
//////////////////////////////////

////////////////////////////////////////////////////////////////

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
