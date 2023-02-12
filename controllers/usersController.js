const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllusers = catchAsync(async (req, res, next) => {
    console.log('fetching');
    const docs = await User.find({});

    res.status(200).json({
        status: 'success',
        requestedAt: res.requestTime,
        results: docs.length,
        data: {
            docs,
        },
    });
});
