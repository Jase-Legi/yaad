const express = require('express');
let app = express();
require('dotenv').config();
let cors = require('cors');
// app.options('*', cors());

const {createReadStream} = require("fs");
const {join, resolve} =require("path");
const bodyParser = require('body-parser');
// const https = require("https");
const createError = require('http-errors');
const {createCanvas, loadImage} = require('canvas');
const checkDirectory = require('./utils/checkdir');
const {writeFileSync}= require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRoute = require('./routes/index.js');
const progresschecker = require('./routes/progresschecker.js');
const { MongoClient, ServerApiVersion } = require('mongodb');

const PORT = process.env.PORT || 5000;
let daORigin = (process.env.NODE_ENV === 'dev')?'http://localhost:3000':'https://yaadlabs.com';

const corsOptions = {
    "origin": daORigin,
    "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 200
}

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({extended: true}));

// app.options('/api/generate', cors(corsOptions));

app.use('/api',indexRoute);
app.use('/progress',progresschecker);
app.use(logger('dev'));
app.use(cookieParser());

// parse application/json in requests
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// This application level middleware prints incoming requests to the servers console, useful to see incoming requests
app.use((req, res, next) => {
  console.log(`Request_Endpoint: ${req.method} ${req.url}`);
  next();
});

// This middleware informs the express application to serve our compiled React files
// if ( process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ) {
//     app.use(express.static(join(__dirname, 'client/build')));

//     app.get('*', function (req, res) {
//         res.sendFile(join(__dirname, 'client/build', 'index.html'));
//     });
// }

if (process.env.NODE_ENV === 'dev') {
    app.use(express.static(join(__dirname, 'client/public')));
}

let upldDir = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')?'client/build/uploads':'client/public/uploads';

let server = app.listen(PORT, (err)=>{
    // if error then log it to the console
    err&&console.log(`error: ${err}.`);
    console.log(`app is listening  on PORT ${PORT}.`);
});
server.timeout = 60000;
// console.log(`address:: ${JSON.stringify(server.address())},\n server connections: ${JSON.stringify(server)}`);
module.exports = app;