'use strict';

var request = require('request');
//var xml2js = require('xml2js');
var dataObject = require('./data-object');

// API url
var apiUrl = 'http://epok.buenosaires.gob.ar/getGeoLayer/?categoria=estaciones_de_bicicletas&estado=*&formato=geojson';

// API entry point
module.exports = function fetch(cb) {
  // Fetch data and create data object on callback
  fetchData(function(err, data) {
    if (err) { cb(err); return; }
    //console.log(typeof JSON.parse(data));
    var json = JSON.parse(data);
    data = formatData(json);
    cb(null, new dataObject(data));
  });
};

// Function that fetches xml data
function fetchData(cb) {
  request(apiUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(null,body);
    } else {
      cb('Fetch error');
    }
  });
}

function formatData(data){
  var d = data.features;
  for(var i = 0; i < d.length ; i++){
    var station = d[i];
    for (var property in station.properties) {
      station[property] = station.properties[property];
    }
    delete station.properties;
    d[i] = station;
  }
  return d;
}

// Function that transforms received xml into json
// function parseXML(xmlString, cb) {
//   var data;
//
//   try {
//     xml2js.parseString(xmlString, {explicitRoot: false, explicitArray: false}, function (err, result) {
//       if (err) throw err;
//
//       data = result['soap:Body'].BicicletasWSResponse.BicicletasWSResult.Bicicletas.Estaciones.Estacion;
//       data.forEach(function(item) {
//         item.BicicletaDisponibles = parseInt(item.BicicletaDisponibles);
//         item.AnclajesTotales = parseInt(item.AnclajesTotales);
//         item.AnclajesDisponibles = parseInt(item.AnclajesDisponibles);
//       });
//     });
//   } catch (e) {
//     return cb('Parse XML error');
//   }
//
//   cb(null, data);
// }
