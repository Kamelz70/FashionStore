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

exports.getAllAddresses = handlerFactory.getAll(Address);
exports.getAddressById = handlerFactory.getOne(Address);
exports.createAddress = handlerFactory.createOne(Address);
//FIXME:not working properly
exports.getMyAdresses = catchAsync(async (req, res, next) => {
    //use protect middleware in router to access user
    //find addresses in address list from user
    //TODO: make parent referencing only with addresses
    let addresses = await Address.find({
        _id: { $in: req.user.addresses },
    });

    if (!addresses) {
        return next(new AppError('no address with such ID found', 404));
    }

    res.status(200).json({ status: 'success', data: addresses });
});
