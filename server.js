var fs = require('fs');
var express = require('express.io');
var app = express();
app.http().io();

app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));

app.get('/activeLevel', function(req, res) {
    fs.readFile(__dirname + '/data/level1.json', 'utf8', function (err, data) {
        res.setHeader('Content-Type', 'text/json');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
});

app.io.route('drawClick', function(req) {
    console.log(req.data);
    app.io.broadcast('draw')
});

app.io.route('join', function(req) {
    console.log(req.data);
});

app.listen(8080);