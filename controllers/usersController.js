const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const filterObj = require('../utils/filtering.js');
//works as middleware
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// used protect middleware before this one, req has user object
// only updates mail and name
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'Cannot update password from this path, use /updatePassword instead'
            ),
            401
        );
    }
    //filter body fields to update
    const filteredBody = filterObj(req.body, 'name', 'email', 'phoneNumbers');
    console.log(filteredBody);
    updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        runValidators: true,
        new: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        status: 'success',
        data: { updatedUser },
    });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false,
    });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
exports.getAllusers = handlerFactory.getAll(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.getUser = handlerFactory.getOne(User);
