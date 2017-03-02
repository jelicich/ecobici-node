var express = require('express');
var ecobici = require('./api/ecobici/lib/ecobici');
var request = require('request');
var fs = require('fs');
var app = express();


//once the dataObj is loaded init ecobiciController

ecobici(function (err, dataObj) {
  if (err) { console.log("An error has occurred: " + err); return; }
  console.log('recieved ecobici api');
  getExtraByStation(dataObj.data);
});

function getExtraByStation(data){

  var arrayStations = [];
  var counter = 0;
  var int = setInterval(function(){
    if(counter == 1) {
      clearInterval(int);
      fs.writeFile("./public/assets/json/stations2.json", JSON.stringify(arrayStations), function(err) {
          if(err) {
              return console.log(err);
          }
          console.log("The file was saved!");
      });
      return;
    }
    console.log('requesting station ' + data[counter].id);
    request('http://epok.buenosaires.gob.ar/getObjectContent/?id='+data[counter].id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        var obj = {
          id: json.id,
          DireccionNormalizada: json.direccionNormalizada,
          Direccion: json.contenido[2].valor,
          AnclajesTotales: json.contenido[5].valor
        }
        arrayStations.push(obj);
        console.log('pushed to array station ' + data[counter].id);
      } else {
        cb('Fetch error');
      }
      counter++;
    });
  },5 * 1000);
}

//listen to port
//app.listen(3000);
//console.log('listening to port 3000');
