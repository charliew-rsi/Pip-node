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
    let i = articles.length -1 || 0;
    if (i < 0) {
        do {
            if (articles[i].slug === req.params.id) {
                res.json(articles[i]);
                foundMatch = true;
            }
            i--;
        }
        while(!foundMatch && i < -1);
    }

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
    const articles = require("./data/articles.json");
    let results = [];
    const searchValues = seperatePositiveAndNegativeSearchValues(req.body);

    const seperatePositiveAndNegativeSearchValues = (searchValuesArr) => {
        let positiveSearchValuesArr = [];
        let negativeSearchValuesArr = [];
        for (var i = 0; i < searchValuesArr.length; i++) {
            if (searchValuesArr[i].charAt(0) === "-") {
                negativeSearchValuesArr.push(searchValuesArr[i]); 
            }
            else {
                positiveSearchValuesArr.push(searchValuesArr[i]); 
            }
        }

        return { positiveSearchValuesArr, negativeSearchValuesArr};

    }

    const isNegative = (searchTerm) => {
        return searchTerm.charAt(0) === "-" ? true : false;
    };

    const addArticle = (article, matchCount) => {
        if (results.length === 0) {
            results.push({article, matchCount});
        } 

        else {
            let isset = false;
            let iter = 0;                       
            do {
                if (matchCount > results[iter].matchCount) {
                    isset = true;
                }
                else if (matchCount === results[iter].matchCount) {
                    isset = true;
                }
                iter++;
            }
            while (!isset && iter < results.length);
            if (!isset) {
                results.push({article, matchCount});
            }    
            
            else {

            }
        }      
    };

    const finalResult = (arr) => {

        for (var i = 0; i < arr.length; i++) {
            delete arr[i].matchCount;
        }
        return arr;
    };

    const removeArticle = (index) => {
        delete results[index];
    }

    const removeUndefined = () => {
        results = results.filter(article => { 
            return article !== undefined;
        })
    }

    const getPattern = (term) => {
        return new RegExp(`${term}`, 'gi');
    };

    const testString = (str, searchValue, articleIndex) => {
        if (isNegative(searchValue)) {
            if (str.match(getPattern(searchValue.substr(1))) !== null) {
                removeArticle(articleIndex);                
            }
        }

        else {
            const matchArr = str.match(getPattern(searchValue)) || null;
            if (matchArr !== null) {
                addArticle(articles[articleIndex], matchArr.length);
            }
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
    };

    const getNegativeMatches = () => {
        //Go through the articles and add the ones that match the positive terms to the results array
        for (var i = 0; i < articles.length; i++) {   
            for (var key in articles[i]) {
                if (articles[i]) {
                    for (var j = 0; j < searchValues.positiveSearchValuesArr.length; j++) {
                        testType(articles[i][key], searchValues.positiveSearchValuesArr[j], i);
                    }
                }
            }
        }
    };

    const getPositiveMatches = () => {
        for (var i = 0; i < results.length; i++) {   
            for (var key in results[i]) {
                if (results[i]) {
                    for (var j = 0; j < searchValues.negativeSearchValuesArr.length; j++) {
                        testType(results[i].article[key], searchValues.negativeSearchValuesArr[j], i);
                    }
                }
            }
        }
    };

    getNegativeMatches();
    getPositiveMatches();
    removeUndefined();
    res.json(finalResult(results));
});

app.get('*', (req, res) => {
    res.sendStatus(404);
});


var server = app.listen(8081, "127.0.0.1", function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Pip-Node app listening at http://%s:%s", host, port)
});