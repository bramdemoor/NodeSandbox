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

var players = [];

app.io.route('join', function(req) {
    players.push({ name : req.data.name, x: 0, y: 0 });
    console.log('Player joined: ' + req.data.name);
    req.io.emit('joinSuccess', req.data)
    app.io.broadcast('playerInfo', players);
});

app.io.route('moved', function(req) {
    for(var i = 0; i < players.length; i++) {
        if(players[i].name == req.data.name) {
            players[i].x = req.data.x;
            players[i].y = req.data.y;
        }
    }
    app.io.broadcast('playerInfo', players);
});


app.listen(8080);