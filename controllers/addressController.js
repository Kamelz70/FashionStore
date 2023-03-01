const catchAsync = require('../utils/catchAsync');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');
//use before addAddress to attatch user to address creation

exports.attatchUserToBody = (req, res, next) => {
    req.body.user = req.user.id;
    next();
};
// middleware to check if a user owns the passed address
exports.checkUserOwnsAddress = catchAsync(async (req, res, next) => {
    const address = await Address.findById(req.params.id);
    if (!address) {
        return next(new AppError('no address with such ID', 403));
    }
    //if address's user id isn't of requesting user
    if (!(address.user == req.user.id)) {
        return next(
            new AppError("user doesn't own address, cannot modify", 404)
        );
    }
    next();
});

exports.getAllAddresses = handlerFactory.getAll(Address);
exports.getAddressById = handlerFactory.getOne(Address);
exports.createAddress = handlerFactory.createOne(Address);
exports.updateAddress = handlerFactory.updateOne(Address);
exports.getMyAdresses = catchAsync(async (req, res, next) => {
    //use protect middleware in router to access user
    //find addresses in address list from user
    //TODO: make parent referencing only with addresses or select -addresses
    let addresses = await Address.find({
        user: req.user.id,
    });

    if (!addresses) {
        return next(new AppError('no address with such ID found', 404));
    }

    res.status(200).json({ status: 'success', data: addresses });
});
