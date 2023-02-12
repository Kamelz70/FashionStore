const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
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
    passwordResetToken: String,
    passwordResetExpiry: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
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
//////////////////////////////////
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

////////////////////////////////////////////////////////////////
userSchema.methods.correctPassword = async function (candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
