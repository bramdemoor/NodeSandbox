var fs = require('fs');
var express = require('express.io');
require('./enchant.js');
var app = express();
require('./src/playerphysics.js');
require('./src/character.js');
app.http().io();

app.io.set('log level', 1);     // Disable verbose log messages

// General declarations
global.activeLevelString = '';
global.activeLevel = undefined;
global.players = [];

// Prepare for web requests
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));

// Load our level
fs.readFile(__dirname + '/data/level1.json', 'utf8', function (err, data) {
    global.activeLevelString = data;
    global.activeLevel = JSON.parse(data).blocks;

    enchant();

    var game = new enchant.Core(320, 320);
    game.fps = 30;
    game.onload = function() {
        var map = new enchant.Map(16, 16);

        map.loadData(global.activeLevel);

        var stage = new enchant.Group();
        game.rootScene.addChild(stage);
        stage.addChild(map);

        // Socket IO Routes

        app.get('/activeLevel', function(req, res) {
            res.setHeader('Content-Type', 'text/json');
            res.setHeader('Content-Length', global.activeLevelString.length);
            res.end(global.activeLevelString);
        });

        app.io.route('join', function(req) {
            var newPlayer = new PlayerCharacter(req.socket.id, req.data.name, stage, map);
            newPlayer.spawn({ x: 100, y:100 });
            global.players.push(newPlayer);
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
                    global.players[i].serverUpdate(req.data);
                }
            }
        });

        app.io.route('shoot', function(req) {
            req.io.broadcast('shoot', req.data);
        });

        app.listen(8080);

        upd();
    };

    var getPlayersFlat = function() {
        var data = [];
        for(var i = 0; i < global.players.length; i++) {
            var p = global.players[i].getFlat();
           // console.log('player: ' + JSON.stringify(p));
            data.push(p);
        }
        return data;
    };

    var upd = function() {
        game._tick(new Date().getTime());

        if(players.length > 0) {
            app.io.broadcast('playerInfo', getPlayersFlat());
        }

        setTimeout(upd, 33);
    };

    game.start();

});

