const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const crypto = require('crypto');

const AppError = require('../utils/appError');
const { promisify } = require('util');

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
//MiddleWare to restrict APIs to roles
exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Permission denied for this account'),
                403
            );
        }
        next();
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

exports.logout = catchAsync((req, res, next) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'success',
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!(email && password)) {
        return next(
            new AppError('please enter email and password to login', 400)
        );
    }
    //get user by mail
    const user = await User.findOne({
        email,
    }).select('+password');
    //compare password
    if (!(user && (await user.correctPassword(password, user.password)))) {
        return next(new AppError('incorrect email or password', 401));
    }
    //if correct sendjwt
    createSendToken(user, 200, req, res);
    //else error
    ///////////////////////
    //email verification.
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //1) check if token is in header, startsWith triggers error when undefined value is checked
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // error if no token
    if (!token) {
        return next(new AppError('Please login', 401));
    }
    const decodedJWT = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY
    );
    //3)verify user still exits

    const user = await User.findById(decodedJWT.id);
    if (!user) {
        return next(new AppError("User doesn't exist anymore", 401));
    }
    //4)check if password wasn't changed after token issuance date

    if (user.passwordChangedAfter(decodedJWT.iat)) {
        return next(
            new AppError(
                'User changed password after token issuance date, please login again',
                401
            )
        );
    }
    //attach user to req
    req.user = user;
    next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1)get user
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new AppError('User ID not found'), 404);
    }
    //2)compare passwords
    if (
        !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
        return next(new AppError('old password is incorrect, retry'), 401);
    }
    //3)set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    //save user with user.save() for pre saves to run
    await user.save();
    //login snd send token
    createSendToken(user, 200, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1)check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('No such user with provided email', 404));
    }
    //2)Generate Token
    const resetToken = user.generatePasswordResetToken();
    // saving user as modifying user in methods don't commit to DB
    //Diasabling validation to modify document
    //3)create reset url
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    //4)send password Email
    const message = `Forgot your Password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}\nIf you didn't forget your password, ignore this mail.`;

    try {
        await new Email(user, resetURL).sendPasswordReset();
        user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;
        user.save({ validateBeforeSave: false });
        console.log(err);
        return next(new AppError('Error sending password reset email', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //hash the token to search in the DB
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    //search the user with the token in params
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: {
            $gt: Date.now(),
        },
    });
    //chack if user is found
    if (!user) {
        return next(new AppError('wrong or expired password reset token', 400));
    }

    //set password and delete token
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpiry = undefined;
    user.passwordResetToken = undefined;
    //save the new user data
    await user.save();
    //send a login jwt
    createSendToken(user, 200, req, res);
});
