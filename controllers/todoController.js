var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extend:false});
var mongoose = require('mongoose');

//connect to db
mongoose.connect('mongodb://test:test@ds161099.mlab.com:61099/ejelicichdb');

//create schema
var todoSchema = new mongoose.Schema({
  item: String
});

//create model
var TodoModel = mongoose.model('Todo', todoSchema);


module.exports = function(app){
  //request handlers get post and delete
  app.get('/todo', function(req, res){
    //get data from mongo and show in view
    TodoModel.find({}, function(err, data){
      if(err) throw err;
      res.render('todo', {todos: data})
    });
  });

  app.post('/todo', urlencodedParser, function(req, res){
    //insert in db
    var newTodoItem = TodoModel(req.body).save(function(err, data){
      if(err) throw err;
      res.json(data);
    })
  });

  app.delete('/todo/:item', function(req, res){
    //delete from db
    TodoModel.find({item: req.params.item.replace(/\-/g, " ")}) // /\-/g, " " replaces the - that comes in the url "sarasa-sarasa" -> "sarasa sarasa"
              .remove(function(err,data){
                if(err) throw err;
                res.json(data);
              })
  })
};
