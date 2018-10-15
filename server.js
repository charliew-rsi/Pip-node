var express = require('express');
var bodyParser = require("body-parser");
var fs = require("fs");

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/user/authenticate', function (req, res) {
    //placeholder until we move user authentication to remote service --CHW
});

app.post('/article/submit', function (req, res) {
    var articles = require("./data/articles.json");
    articles.push(req.body);
    fs.writeFile('data/articles.json', JSON.stringify(articles), (err) => {
        if (err) throw err;
      });    
 });

 app.post('/article/count', function(req, res){ 
    var articles = require("./data/articles.json");
    return articles.length;
 });


var server = app.listen(8081, "127.0.0.1", function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Pip-Node app listening at http://%s:%s", host, port)
});