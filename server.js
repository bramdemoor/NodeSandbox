var fs = require('fs');
var express = require('express.io');
require('./enchant.js');
var app = express();
app.http().io();

// General declarations
global.activeLevel = [];
global.players = [];

// Prepare for web requests
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));

// Load our level
fs.readFile(__dirname + '/data/level1.json', 'utf8', function (err, data) {

    activeLevel = data;

    // Socket IO Routes

    app.get('/activeLevel', function(req, res) {
        res.setHeader('Content-Type', 'text/json');
        res.setHeader('Content-Length', global.activeLevel.length);
        res.end(global.activeLevel);
    });

    app.io.route('join', function(req) {
        global.players.push({ socketid: req.socket.id, name : req.data.name, x: 0, y: 0, health: 100, score: 0, upPressed: false, leftPressed: false, rightPressed: false });
        console.log('Player joined: ' + req.data.name + ' (id: ' + req.socket.id + ')');
        req.io.emit('joinSuccess', req.data)
    });

    app.io.route('disconnect', function(req) {
        console.log('USER DISCONNECTED: ' + req.socket.id);
        for(var i = 0; i < global.players.length; i++) {
            if(global.players[i].socketid == req.socket.id) {
                global.players.splice(i,1);
                console.log('REMOVED PLAYER');
            }
        }
    });

    app.io.route('moved', function(req) {
        for(var i = 0; i < players.length; i++) {
            if(global.players[i].socketid == req.socket.id) {
                global.players[i].x = req.data.x;
                global.players[i].y = req.data.y;
                global.players[i].health = req.data.health;
                global.players[i].score = req.data.score;
                global.players[i].upPressed = req.data.upPressed;
                global.players[i].leftPressed = req.data.leftPressed;
                global.players[i].rightPressed = req.data.rightPressed;
            }
        }
    });

    app.io.route('shoot', function(req) {
        req.io.broadcast('shoot', req.data);
    });

    app.listen(8080);

    enchant();

    var game = new enchant.Core(320, 320);
    game.fps = 30;
    game.onload = function() {
        var map = new enchant.Map(16, 16);
        map.loadData(global.activeLevel);
        var stage = new enchant.Group();
        game.rootScene.addChild(stage);
        stage.addChild(map);
    };

    var upd = function() {
        game._tick(new Date().getTime());
        app.io.broadcast('playerInfo', players);
        setTimeout(upd, 100);
    };

    game.start();

    upd();
});

