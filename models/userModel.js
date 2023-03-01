const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validatePhoneNumber = require('validate-phone-number-node-js');
const Cart = require('./cartModel');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        minLength: 4,
        validate: [
            (val) =>
                validator.isAlphanumeric(val, 'en-US', {
                    ignore: ' ',
                }),
            'name must only contain letters or numbers',
        ],
        required: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    photo: {
        type: String,
        default: 'default.jpg',
        trim: true,
    },
    password: {
        required: true,
        type: String,
        minLength: 8,
        select: false,
    },
    passwordConfirm: {
        required: true,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'password confirmation incorrect',
        },
        type: String,
    },
    passwordChangedAt: {
        type: Date,
    },
    role: {
        type: String,
        trim: true,
        enum: ['user', 'admin'],
        default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpiry: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    phoneNumbers: {
        type: [String],
        trim: true,
        validate: {
            validator: function (list) {
                var flag = 0;
                list.forEach((num) => {
                    if (!validatePhoneNumber.validate(num)) {
                        flag = 1;
                    }
                });
                return flag ? false : true;
            },
            message: 'phone number invalid',
        },
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
    addresses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
        },
    ],
});
/////////////// Document middleware .save,.create
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 13);
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre('save', async function (next) {
    // if no password modification return
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    // minus 1 second as creating a jwt token can be faster than saving to db, making it invalid when changing password
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre('save', async function (next) {
    // create cart id user has none or is new
    if (this.isNew || !this.cart) {
        const cart = await Cart.create({ user: this.id });

        if (!cart) {
            return next(new AppError("couldn't create cart for user", 500));
        }
        this.cart = cart.id;
    }
    next();
});
//////////////////////////////////
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

///////////////////// Deleting a user deletes his Cart
userSchema.pre(/([D|d]elete|[r]emove)/, async function (next) {
    // query middleware getQuery gets query
    const thisDoc = await User.findOne(this.getQuery());
    if (!thisDoc) {
        return next();
    }
    let cartDoc = await Cart.findByIdAndDelete(thisDoc.cart);
    if (!cartDoc) {
        return next();
    }

    next();
});
////////////////////////////////////////////////////////////////
userSchema.methods.correctPassword = async function (candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.passwordChangedAfter = function (date) {
    if (this.passwordChangedAt) {
        //convert to millisecs with gettime, then get seconds and parse to int
        const passwordDate = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return passwordDate > date;
    }
    return false;
};

userSchema.methods.generatePasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    //10 mins expiry
    this.passwordResetExpiry =
        Date.now() + process.env.PASSWORD_RESET_EXPIRY_MINS * 60 * 1000;
    return token;
    //Even after modifying the doc, it still needs .save()
};
const User = mongoose.model('User', userSchema);
module.exports = User;
