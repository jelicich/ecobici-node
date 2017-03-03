var express = require('express');
//var db = require('./config/db/connection');
//var todoController = require('./controllers/todoController');
var app = express();
var server = app.listen(3003);
var io = require('socket.io')(server);

var ecobici = require('./backend/api/ecobici/lib/ecobici');
var homeController = require('./backend/controllers/homeController');
var ecobiciController = require('./backend/controllers/ecobiciController');

//connect to db
//db.connect();

//set up templates engine
app.set('view engine', 'ejs');

//static files css and js to be served
app.use(express.static(__dirname + '/public'))

//fire controllers
homeController(app);
ecobiciController(app, io);



//listen to port
//app.listen(3003);
console.log('listening to port 3003');
