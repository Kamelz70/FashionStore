const express = require('express');
const usersRouter = require('./routers/usersRouter');
const app = express();
app.use(
    express.json({
        limit: '10kb',
    })
);
app.use('/api/v1/users', usersRouter);
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'No such page',
    });
    // const err =
    //     next(err);
});

module.exports = app;
