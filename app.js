var express = require('express');
//var db = require('./config/db/connection');
//var todoController = require('./controllers/todoController');
var ecobici = require('./api/ecobici/lib/ecobici');
var homeController = require('./controllers/homeController');
var ecobiciController = require('./controllers/ecobiciController');
var app = express();
var server = app.listen(3003);
var io = require('socket.io')(server);

//connect to db
//db.connect();

//set up templates engine
app.set('view engine', 'ejs');

//static files css and js to be served
app.use(express.static('./public'))

//fire controllers
homeController(app);
ecobiciController(app, io)



//listen to port
//app.listen(3003);
console.log('listening to port 3003');
