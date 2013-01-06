var express = require('express.io');
var app = express();
app.http().io();

// Express
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.listen(8080);

// Socket io
app.io.route('drawClick', function(req) {
    req.io.broadcast('draw', req.data)
});