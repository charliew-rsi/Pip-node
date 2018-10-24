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
    req.body["slug"] = `${req.body["slug"]}${req.body["uuid"]}}`;
    articles.push(req.body);    
    fs.writeFile('data/articles.json', JSON.stringify(articles), (err) => {
        if (err) throw err;
      });    
 });

app.get('/article/count', (req, res) => { 
    const articles = require("./data/articles.json");
    if (typeof articles === "undefined") {
        res.sendStatus(500);
    }
    else {
        res.json({count: articles.length});
    }
});

app.get('/article/:id', (req, res) => {
    const articles = require("./data/articles.json");    
    req.params.id;
    let foundMatch = false;
    let i = 0;
    do {
        if (articles[i].slug === req.params.id) {
            res.json(articles[i]);
            foundMatch = true;
        }
        i++;
    }
    while(!foundMatch && i < articles.length);
    
    let article;


});

app.get('/articles/:pageNumber', (req, res) => { 
    const articles = require("./data/articles.json");        
    const index = req.params.pageNumber -1;
    const threshold = index + 10 < articles.length ? index + 10 : articles.length;
    const selectedArticles = articles.slice(index, threshold);
    res.json({articles: selectedArticles});
});

app.post('/user/create', (req, res) => {
      
});


app.get('/tags/all', (req, res) => {
    //grab all tags values, put in big array, sort array, filter out repeated values
    const articles = require("./data/articles.json");    
    let tagArr = [];
    for(var key in articles) {
        tagArr = [...tagArr, ...articles[key].tags];
    }    
    tagArr.sort();
    for (var i = 0; i < tagArr.length; i++) {
        let hasDuplicates = true;
        do {
            if (tagArr[i] === tagArr[i + 1]) {
                tagArr.splice(i+1, 1);            
            }
            else {
                hasDuplicates = false;
            }
        }
        while(hasDuplicates);
    }
    res.json({tags: tagArr});
});

app.post('/search', (req, res) => {

    const sortByLength = (searchTermsArr) => {
        for (var i = 0; i < searchTermsArr.length; i++) {
            if (i < searchTermsArr.length - 1) {
                if (searchTermsArr[i + 1])
            }
        }
    };

    const isNegative = (searchTerm) => {
        return searchTerm.charAt(0) === "-" ? true : false;
    };
    
    const sortSearchTerms = (searchTermsArr) => {
        //sort negative search terms to the top
        let negativeTermsArr = [];
        for(var i = 0; i < searchTermsArr.length; i++) {        
            if (isNegative(searchTermsArr[i])) {
                negativeTermsArr.push(...searchTermsArr.splice(i, i+1));
            }
        }
        searchTermsArr = sortByLength(searchTermsArr);
        return [...searchTermsArr, ...negativeTermsArr];
    };

    const removeArticle = (index) => {
        articles.splice(index, index+1);
    }

    let articles = require("./data/articles.json");

    const searchValuesArr = sortSearchTerms(req.body);
    let results;

    

    const testString = (str, searchValue, articleIndex) => {
        if (isNegative(searchValue) && str.match(searchValue.substr(1))) {
            removeArticle(articleIndex);
        }

        if (!isNegative(searchValue) && str.match(searchValue) === "null") {
            console.log("article contains no reference to react");
            removeArticle(articleIndex);
        }
    };

    const testType = (obj, searchValue, articleIndex) => {
        if (typeof obj === "string") {
            testString(obj, searchValue, articleIndex);
        }
        else {
            for (var prop in obj) {
                testType(prop, searchValue, articleIndex);
            }
        }
    }

    for (var i = 0; i < articles.length; i++) {   
        for (var key in articles[i]) {
            for (var j = 0; j < searchValuesArr.length; j++) {
                testType(articles[i][key], searchValuesArr[j], i);
            }

        }

    }
    
    console.log(articles.length);    
});

app.get('*', (req, res) => {
    res.sendStatus(404);
});


var server = app.listen(8081, "127.0.0.1", function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Pip-Node app listening at http://%s:%s", host, port)
});