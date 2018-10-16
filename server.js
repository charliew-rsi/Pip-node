var express = require('express');
var bodyParser = require("body-parser");
var uuidv1 = require("uuid/v1");
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

app.post('/article/submit', (req, res) => {
    var articles = require("./data/articles.json");
    req.body["uuid"] = uuidv1();
    articles.push(req.body);
    console.log("submitted article");
    fs.writeFile('data/articles.json', JSON.stringify(articles), (err) => {
        if (err) throw err;
      });    
 });

app.get('/article/count', (req, res) => { 
var articles = require("./data/articles.json");
if (typeof articles === "undefined") {
    res.sendStatus(500);
}
else {
    res.json({count: articles.length});
}
});

app.get('/articles/:pageNumber', (req, res) => { 
    const articles = require("./data/articles.json");        
    const index = req.params.pageNumber -1;
    const threshold = index + 10 < articles.length ? index + 10 : articles.length;
    const selectedArticles = articles.slice(index, threshold);
    res.json({articles: selectedArticles});
});



var server = app.listen(8081, "127.0.0.1", function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Pip-Node app listening at http://%s:%s", host, port)
});