const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        //for both routes (products/:productID/reveiws) and (/reviews) ((HACK))
        let filter;
        if (req.params.productID) {
            filter = {
                product: req.params.productID,
            };
        }
        // still needs pagination.....
        features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .paginate()
            .sort()
            .limitFields();
        const docs = await features.query;
        res.status(200).json({
            status: 'success',
            requetedAt: res.requestTime,
            results: docs.length,
            data: {
                docs: docs,
            },
        });
    });
exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndRemove(req.params.id);
        if (!doc) {
            return next(new AppError('no such document with ID found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new AppError('no such document with ID found', 404));
        }
        res.status(200).json({ status: 'success', data: doc });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        //if popOptions exist, populate and await
        if (popOptions) {
            query = query.populate(popOptions);
        }
        const doc = await query;
        if (!doc) {
            return next(new AppError('no such document with ID found', 404));
        }
        res.status(200).json({ status: 'success', data: doc });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // still needs populate options implemented

        const doc = await Model.create(req.body);
        if (!doc) {
            return next(new AppError('no such document with ID found', 404));
        }
        res.status(201).json({ status: 'success', data: doc });
    });
