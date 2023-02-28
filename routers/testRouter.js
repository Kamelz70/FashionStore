const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const catchAsync = require('../utils/catchAsync');
const StockItem = require('../models/stockItemModel');
const mongoose = require('mongoose');
const router = express.Router();
//no authorization needed at this point
const F = catchAsync(async (req, res, next) => {
    const data = await StockItem.aggregate([
        {
            $match: {
                product: mongoose.Types.ObjectId('63fe0060bd399c9bf04f5d59'),
            },
        },

        {
            // group by tourId so that stats of all docs containing this id are grouped
            $group: {
                _id: '$color',
            },
        },
    ]);
    res.status(200).json({ data });
});
router.route('/').get(F);

module.exports = router;
