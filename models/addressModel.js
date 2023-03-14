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
        minLength: 3,
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
        validate: {
            validator: async function (value) {
                // if no mods done to user, return
                if (!this.isModified('user')) {
                    return true;
                }
                // else check user
                const user = await User.findById(value).select('id');
                if (!user) {
                    return false;
                }
                return true;
            },
            message: "user id doesn't exist",
        },
    },
    createdAt: { type: Date, default: Date.now() },
});
/////////////// Document middleware .save,.create

addressSchema.index({
    user: 1,
});
/////////////////////////////
addressSchema.statics.getUserAddressList = async function (userId) {
    //get all addresses which references the user
    var addressList = await Address.find({
        user: userId,
    }).select('_id');
    //make only addresses in the array
    addressList = addressList.map((el) => {
        return el['_id'];
    });
    //return modified user document
    return addressList;
};
/////////////////////////////
///////////////////// Saving address rechecks user's addresses list

addressSchema.pre('save', async function (next) {
    // create cart id user has none or is new
    this.wasNew = this.isNew;
    next();
});
addressSchema.post(/(save)/, async function (doc) {
    if (this.wasNew) {
        const addressList = await doc.constructor.getUserAddressList(doc.user);
        // set stockItems in product
        await User.findByIdAndUpdate(doc.user, { addresses: addressList });
    }
});

///////////////////// Saving address rechecks user's addresses list
addressSchema.pre(/([D|d]elete|[R|r]emove)/, async function (next) {
    // create cart id user has none or is new
    const thisAddress = await Address.findOne(this.getQuery());

    if (!thisAddress) {
        return next(new AppError("couldn't find address", 404));
    }
    let user = await User.findById(thisAddress.user);
    if (!user) {
        return next(new AppError("couldn't find user", 404));
    }
    // call getUserAddressList above to recheck address list
    user = await thisAddress.constructor.getUserAddressList(user);
    // save modified user
    user.save({ validateBeforeSave: false });
    next();
});
////////////////////////////////////////////////////////////////

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
