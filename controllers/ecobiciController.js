var bodyParser = require('body-parser');
var events = require('events');
var ecobici = require('../api/ecobici/lib/ecobici');

var urlencodedParser = bodyParser.urlencoded({extended:false});
//var loaderEmitter = new events.EventEmitter();
const timeOut = 30;
const methods = {
    allStations: 'allStations',
    usage: 'usage'
};

var isWaiting = false;
var interval;

module.exports = EcobiciController;

function EcobiciController(app, io) {
  io.on('connection', function(socket) {
      console.log('client connected');

      // ecobici(function(err,dataObj){
      //   if (err) { console.log("An error has occurred: " + err); return; }
      //   console.log('recieved ecobici api');
      //   var data = dataObj.data;
      //   socket.emit('messages', data);
      //   isWaiting = false;
      // })
      getData();

      interval = setInterval(getData, timeOut * 1000);

      function getData(){
        if(isWaiting) return;
        isWaiting = true;
        ecobici(function(err,dataObj){
          if (err) { console.log("An error has occurred: " + err); return; }
          console.log('recieved ecobici api');
          var data = dataObj.data;
          socket.emit('messages', data);
          isWaiting = false;
        });
      };

      socket.on('disconnect', function(){
        console.log('cliente disconnected');
        clearInterval(interval);
      });

  });


};
