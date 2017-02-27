var mongoose = require('mongoose');
module.exports = {
  connect: function(){
    mongoose.connect('mongodb://test:test@ds161099.mlab.com:61099/ejelicichdb');

    mongoose.connection.once('open', function() {
      console.log('DB connection open');
    }).on('error', function(error) {
      console.log('DB connection error: ', error);
    });
  }
}
