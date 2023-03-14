const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});
dotenv.config({
    path: './config.env',
});
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', false);
mongoose
    .connect(encodeURI(DB), {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log('successful DB connection');
    })
    .catch((err) => {
        console.log('DB connection error:', err, err.message);
    });
const port = process.env.port || 3000;
const server = app.listen(port, () => {
    console.log('server listening');
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
    process.exit(1);
});
//herkou sends sigterm to shutdown every 24 hours
process.on('SIGTERM', () => {
    console.log('SIGTERM recieved, Shutting down gracefully');
    //server.close gracefully ends execution by handling open requests first
    server.close(() => {
        //we don't need to process.exit as sigterm does so
    });
});
