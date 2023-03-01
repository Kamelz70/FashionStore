const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const GlobalErrorHandler = require('./controllers/errorController');
const usersRouter = require('./routers/usersRouter');
const productRouter = require('./routers/productRouter');
const stockItemRouter = require('./routers/stockItemRouter');
const addressRouter = require('./routers/addressRouter');

const cartRouter = require('./routers/cartRouter');

const testRouter = require('./routers/testRouter');
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
//////////////// Routers
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/stockItems', stockItemRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/test', testRouter);

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'No such page',
    });
    // const err =
    //     next(err);
});
//error handling middleware (has 4 parameters)
app.use(GlobalErrorHandler);

module.exports = app;
