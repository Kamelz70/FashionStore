const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
    jwt.sign(
        {
            id: id,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRATION_PERIOD,
        }
    );
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, {
        httpOnly: true,
        expires: new Date(
            Date.now() +
                process.env.JWT_EXPIRATION_PERIOD_IN_DAYS * 24 * 60 * 60 * 1000
        ),
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
    // in case of signup:
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user,
        },
    });
};
exports.signUp = catchAsync(async (req, res, next) => {
    console.log('signingUp');
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
    });
    //email verification.
    createSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    console.log('loggingIn');
    const { email, password } = req.body;
    if (!(email && password)) {
        return next(
            new AppError('please enter email and password to login', 400)
        );
    }
    const user = await User.findOne({
        email,
    }).select('+password');
    //get user by name
    if (!(user && (await user.correctPassword(password, user.password)))) {
        return next(new AppError('incorrect email or password', 401));
    }
    //compare password
    //if correct sendjwt
    createSendToken(user, 200, req, res);
    //else error
    ///////////////////////
    //email verification.
});
