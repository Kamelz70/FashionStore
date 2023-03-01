const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validatePhoneNumber = require('validate-phone-number-node-js');
const Cart = require('./cartModel');
const User = require('./userModel');

const AppError = require('../utils/appError');

const addressSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minLength: 4,
        required: true,
    },

    province: {
        type: String,
        trim: true,
        required: true,
        minLength: 4,
    },
    city: {
        type: String,
        trim: true,
        required: true,
        minLength: 4,
    },
    buildingNum: {
        type: String,
        minLength: 1,
        required: true,
    },
    floor: {
        type: String,
        required: true,
        minLength: 1,
    },
    flat: {
        type: String,
        required: true,
        minLength: 1,
    },

    locationLngLat: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            default: 'Point',
        },
        coordinates: {
            type: [Number],
        },
    },
    extraDescription: {
        type: String,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});
/////////////// Document middleware .save,.create

addressSchema.pre('save', async function (next) {
    // create cart id user has none or is new
    if (this.isNew) {
        const user = await User.findById(this.user);

        if (!user) {
            return next(new AppError("couldn't find user", 404));
        }
        user.addresses[user.addresses.length] = this.id;
        user.save({ validateBeforeSave: false });
    }
    next();
});

///////////////////// Deleting a user deletes his Cart
addressSchema.pre(/([D|d]elete|[r]emove)/, async function (next) {
    // create cart id user has none or is new
    const thisAddress = await Address.findOne(this.getQuery());

    if (!thisAddress) {
        return next(new AppError("couldn't find address", 404));
    }
    const user = await User.findById(thisAddress.user);
    user.addresses.append(this.id);
    user.save();

    next();
});
////////////////////////////////////////////////////////////////

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
