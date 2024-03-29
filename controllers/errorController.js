const { error } = require('console');
const AppError = require('../utils/appError');

const HandleCastError = (error) =>
    new AppError(`Invalid ${error.path}: ${error.value}`, 400);
const HandleDuplicateFieldError = (error) =>
    new AppError(
        `Duplicate field value: ${error.keyValue.name}, please use a new value`,
        400
    );
const HandleInvalidTokenError = () =>
    new AppError(`Invalid token, please login`, 401);
const HandleExpiredTokenError = () =>
    new AppError(`token expired, please login`, 401);
const HandleValidationError = (error) => {
    const message = Object.values(error.errors)
        .map((el) => el.message)
        .join('. ');
    return new AppError(`Invalid Input: ${message}`, 400);
};
////////////////////////////////
const sendErrorProd = (req, res, err) => {
    if (err.isOperational) {
        console.error('Error: 😢', err);
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error('Error: 😢', err);
        return res.status(500).json('error', {
            status: 500,
            msg: 'something went wrong',
        });
    }
};

const sendErrorDev = (req, res, err) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if ((process.env.NODE_ENV = 'development')) {
        sendErrorDev(req, res, err);
    } else {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'MongoCastError') {
            error = HandleCastError(error);
        }
        if (err.code === 11000) {
            error = HandleDuplicateFieldError(error);
        }
        if (err.name === 'MongoValidationError') {
            error = HandleValidationError(error);
        }
        if (err.name === 'JsonWebTokenError') {
            error = HandleInvalidTokenError();
        }
        if (err.name === 'TokenExpiredError') {
            error = HandleExpiredTokenError();
        }

        sendErrorProd(req, res, error);
    }
};
