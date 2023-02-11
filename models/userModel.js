const mongoose = require('mongoose');
const validator = require('validator');

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
const User = mongoose.model('User', userSchema);
module.exports = User;
