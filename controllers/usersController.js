const User = require('../models/userModel');
exports.getAllusers = async (req, res, next) => {
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
};
