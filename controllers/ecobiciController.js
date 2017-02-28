var bodyParser = require('body-parser');
var events = require('events');
var ecobici = require('../api/ecobici/lib/ecobici');

var urlencodedParser = bodyParser.urlencoded({extend:false});
var loaderEmitter = new events.EventEmitter();

const methods = {
    allStations: 'allStations',
    usage: 'usage'
};


module.exports = EcobiciController;

function EcobiciController(app, dataObject) {
  this.dataObject = dataObject;

  app.post('/ecobici/:method', urlencodedParser, function(req, res){
    console.log('llego una post req de ' + req.url);

    if(!dataObject) return;

    var jsonResp = {};
    var method = req.params.method;
    switch (method) {
      case methods.allStations:
        //console.log(getAllStations());
        jsonResp.status = 'ok';
        jsonResp.set = dataObject.data;
        break;

      case methods.usage:
        jsonResp.status = 'ok';
        jsonResp.set = dataObject.usageLevel();

      default:
    };
    res.json(jsonResp);
  });
}

// Return operational stations
