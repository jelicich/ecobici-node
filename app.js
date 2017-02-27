var express = require('express');
//var db = require('./config/db/connection');
//var todoController = require('./controllers/todoController');
var ecobici = require('./api/ecobici/lib/ecobici');
var homeController = require('./controllers/homeController')
var ecobiciController = require('./controllers/ecobiciController');
var app = express();

//connect to db
//db.connect();

//set up templates engine
app.set('view engine', 'ejs');

//static files css and js to be served
app.use(express.static('./public'))

//fire controllers
homeController(app);

//once the dataObj is loaded init ecobiciController
ecobici(function (err, dataObj) {
  if (err) { console.log("An error has occurred: " + err); return; }
  console.log('recieved ecobici api');
  ecobiciController(app, dataObj);
  // console.log(dataObj.data); returns general info about every station
  // console.log(dataObj.available()); returns available stations
  // console.log(dataObj.unavailable()); returns not available stations
  // console.log(dataObj.withMoreBikes(3)); returns 3 stations with more bikes
  // console.log(dataObj.withLessBikes(3)); returns 3 stations with fewer bikes
  // console.log(dataObj.withBikes()); returns stations with at least 1 bikes
  // console.log(dataObj.usageLevel()); returns overall usage level
});

//listen to port
app.listen(3000);
console.log('listening to port 3000');
