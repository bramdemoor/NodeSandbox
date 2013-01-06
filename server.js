var express = require('express');

var app = express();

app.use(express.logger('dev'));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));

app.use(app.router);

app.listen(8080);