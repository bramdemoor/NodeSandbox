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
    players.push({ socketid: req.socket.id, name : req.data.name, x: 0, y: 0, health: 100, score: 0, upPressed: false, leftPressed: false, rightPressed: false });
    console.log('Player joined: ' + req.data.name + ' (id: ' + req.socket.id + ')');
    req.io.emit('joinSuccess', req.data)
});

app.io.route('disconnect', function(req) {
    console.log('USER DISCONNECTED: ' + req.socket.id);

    // Remove this player
    for(var i = 0; i < players.length; i++) {
        if(players[i].socketid == req.socket.id) {
            players.splice(i,1);
            console.log('REMOVED PLAYER');
        }
    }
});

app.io.route('moved', function(req) {
    for(var i = 0; i < players.length; i++) {
        if(players[i].socketid == req.socket.id) {
            players[i].x = req.data.x;
            players[i].y = req.data.y;
            players[i].health = req.data.health;
            players[i].score = req.data.score;
            players[i].upPressed = req.data.upPressed;
            players[i].leftPressed = req.data.leftPressed;
            players[i].rightPressed = req.data.rightPressed;
        }
    }
});

app.io.route('shoot', function(req) {
    req.io.broadcast('shoot', req.data);
});

app.listen(8080);

// Temporary server-side broadcast loop.

function resp() {
    setTimeout(function() {
        app.io.broadcast('playerInfo', players);
        resp();
    }, 1);
}

resp();