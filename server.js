var express = require('express.io');
var app = express();
app.http().io();

app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));


app.io.route('drawClick', function(req) {
    console.log(req.data);
    app.io.broadcast('draw')
});

app.listen(8080);