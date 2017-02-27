module.exports = function(app) {
  //set listener to handle get requests
  app.get('/', function(req, res){
    res.render('home')
  });
}
