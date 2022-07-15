const express = require('express');
let app = express();
const cors = require('cors');
const {createReadStream} = require("fs");
const {join, resolve} =require("path");
const bodyParser = require('body-parser');
// const https = require("https")
const createError = require('http-errors');
const {createCanvas, loadImage} = require('canvas');
const checkDirectory = require('./utils/checkdir');
const {writeFileSync}= require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRoute = require('./routes/index.js');
const progresschecker = require('./routes/progresschecker.js');
const { MongoClient, ServerApiVersion } = require('mongodb');
const pinataSDK = require('@pinata/sdk');

require('dotenv').config();
const PORT = process.env.PORT || 5000
app.use(bodyParser.urlencoded({extended: true}))
const corsOptions = {
    "origin": 'https://yaadlabs.com',
    "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 200
}

app.use(cors(corsOptions));
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

  
// web: npm start
// API calls
// app.get('/api/', (req, res) => {
//   res.json({ message: 'Hello From Express' });
// });

// This middleware informs the express application to serve our compiled React files
if ( process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ) {
    app.use(express.static(join(__dirname, 'client/build')));

    app.get('*', function (req, res) {
        res.sendFile(join(__dirname, 'client/build', 'index.html'));
    });
}

if (process.env.NODE_ENV === 'dev') {
  app.use(express.static(join(__dirname, 'client/public')));
}

// const uri = process.env.MONGO_DB_URI;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// (async function(){
//   let db;
//   const dbname = 'yaad';
//   let client;
//   try{
//       client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//       const connected = await client.connect();
//       db = connected.db('yaad');
//       const nftcoll = db.collection('nfts');
      
//   }catch(err){
//       console.log(err.stack);
//   }
//   if(client){
    
//       db.listCollections().toArray((er,coll)=>{
//           for(var i=0;i<coll.length;i++){
//               console.log((i+1)+') collection name: '+coll[i].name);
//               // db.collection(coll[i].name).drop((efr,tt)=>{
//               //     if(efr) throw efr;
//               // })
//           }
//       });
//       // client.close();
//   }
// })()

let upldDir = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')?'client/build/uploads':'client/public/uploads';

app.listen(PORT,(err)=>{
    // if error then log it to the console
    err&&console.log(`error: ${err}.`);
    console.log(`app is listening  on PORT ${PORT}.`);
});
module.exports = app;