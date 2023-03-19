const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Routes
const authRoutes = require('./src/routes/user-auth');
const userRoutes = require('./src/routes/user');
const airlineRoutes = require('./src/routes/airlines');
const packageRoutes = require('./src/routes/packages');
const hotelRoutes = require('./src/routes/hotels');
const profileRoutes = require('./src/routes/profile');
const travelRoutes = require('./src/routes/travellers');

//Solr
// require('./src/helpers/init_solr');

//Connection db
require('./src/helpers/init_mongo_db');

//Connection Redis
require('./src/helpers/init_redis');

//Connection Nodemon
require('./src/helpers/init_nodemon');

mongoose.Promise = global.Promise;

//PARSER SETTING
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false,limit:'50mb'}));
app.use(express.json({limit:'50mb'}));

//CORS SETTING
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
});

//Main Routes
app.use('/v1/consumer/auth',authRoutes);
app.use('/v1/user',userRoutes);
app.use('/v1/airlines',airlineRoutes);
app.use('/v1/package',packageRoutes);
app.use('/v1/hotel',hotelRoutes);
app.use('/v1/adminProfile',profileRoutes);
app.use('/v1/consumer/traveller',travelRoutes);

//MIDDLEWARE
app.use((req, res, next) => {
    const error = new Error('Bad Request');
    error.status = 404;
    next(error);
})
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;


