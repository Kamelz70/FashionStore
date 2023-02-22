const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routers/usersRouter');
const app = express();
app.use(
    express.json({
        limit: '10kb',
    })
);

app.use(cookieParser());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use((req, res, next) => {
    res.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

app.use('/api/v1/users', usersRouter);

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'No such page',
    });
    // const err =
    //     next(err);
});

module.exports = app;
