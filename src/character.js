    PlayerCharacter = function(socketid, name, stage, map) {
        var self = this;
        self.stage = stage;
        self.map = map;
        self.socketid = socketid;
        self.name = name;
        self.sprite = new enchant.Sprite(32, 32);
        self.pose = 0;
        self.physics = undefined;
        self.alive = false;
        self.score = 0;
        self.health = 100;
        self.upPressed = false;
        self.leftPressed = false;
        self.rightPressed = false;
        self.syncCounter = 0;

        self.getFlat = function() {
            return {
                name:self.name,
                x:self.sprite.x,
                y:self.sprite.y,
                score:self.score,
                health:self.health,
                upPressed:self.upPressed,
                leftPressed:self.leftPressed,
                rightPressed:self.rightPressed,
                incx: self.physics.incx,
                incy: self.physics.incy
            };
        };

        self.serverUpdate = function(data) {
            self.upPressed = data.upPressed;
            self.leftPressed = data.leftPressed;
            self.rightPressed = data.rightPressed;
        };

        self.update = function() {
            if(!self.alive) return;

            if(self.sprite.y > 320 || self.health < 1) {
                self.die();
            }

            self.physics.update(self.sprite.x, self.sprite.y, self.upPressed, self.leftPressed, self.rightPressed);
            self.sprite.x = self.physics.getX();
            self.sprite.y = self.physics.getY();
        };

        self.onWantsToMove = function() {  };

        self.onJump = function() {  };

        self.onCollideLeft = function() { };

        self.onCollideRight = function() { };

        self.onCollideTop = function() { };

        self.onCollideFloor = function(crossing, boundary) {
            if(map.checkTile(crossing, boundary) == 10) {
                // Spikes!!!
                self.die();
            }
        };

        self.shoot = function () {
            var dir = self.sprite.scaleX;
            var x = self.sprite.x + 10 + (25 * dir);
            var y = self.sprite.y + 10;
          //  new App.Bullet(x, y, dir);
        };

        self.die = function () {
            self.health = 0;
            self.alive = false;
            self.score -= 10;
            self.physics = undefined;   // Destroy this so it will be reset when spawning
            self.sprite.tl.delay(20).then(function (e) { self.spawn({ x: 100, y: 100}); });
            // App.socket.emit('died', { });
        };

        self.spawn = function (spawnpoint) {
            self.sprite.x = spawnpoint.x;
            self.sprite.y = spawnpoint.y;
            self.health = 100;
            self.stage.addChild(self.sprite);
            self.physics = new Physics(self);
            self.sprite.addEventListener('enterframe', self.update);
            //App.socket.emit('spawned', { });
            self.alive = true;
        };
    };

