    PlayerCharacter = function(socketid, name) {
        var self = this;

        self.name = name;
        self.sprite = new enchant.Sprite(32, 32);
        self.pose = 0;
        self.physics = undefined;
        self.alive = false;
        self.isLocal = false;
        self.score = 0;
        self.health = 100;
        self.upPressed = false;
        self.leftPressed = false;
        self.rightPressed = false;
        self.syncCounter = 0;

        self.serverUpdate = function(req) {
            self.sprite.x = req.data.x;
            self.sprite.y = req.data.y;
            self.health = req.data.health;
            self.score = req.data.score;
            self.upPressed = req.data.upPressed;
            self.leftPressed = req.data.leftPressed;
            self.rightPressed = req.data.rightPressed;
        };

        self.update = function() {
            var inputChanged = false;
            if(self.isLocal()) {
                inputChanged = self.handleKeys();
            }

            if(!self.alive) return;

            self.physics.update(self.sprite.x, self.sprite.y, self.upPressed, self.leftPressed, self.rightPressed);
            self.sprite.x = self.physics.getX();
            self.sprite.y = self.physics.getY();
            self.nameLabel.x = self.physics.getX() - 2;
            self.nameLabel.y = self.physics.getY() - 20;
        };

        self.onWantsToMove = function() {
            self.sprite.scaleX = self.physics.goalDir == 0 ? self.sprite.scaleX : self.physics.goalDir;

            if (self.physics.goalDir != 0) {

                self.sprite.frame = self.pose + 1;
            } else {
                self.sprite.frame = 0;
            }
        };

        self.onJump = function() {

        };

        self.onCollideFloor = function(crossing, boundary) {
            //if (App.GameEngine.Map.checkTile(crossing, boundary) == 10) {
                // Spikes!!!
            //    self.die();
            //}
        };

        self.shoot = function () {
            var dir = self.sprite.scaleX;
            var x = self.sprite.x + 10 + (25 * dir);
            var y = self.sprite.y + 10;
          //  new App.Bullet(x, y, dir);
          //  App.socket.emit('shoot', { name: self.name, x: x, y: y, dir: dir });
        };

        self.die = function () {
            self.health(0);

            self.alive = false;

            self.score(self.score() - 10);

            self.physics = undefined;   // Destroy this so it will be reset when spawning

            self.sprite.tl.delay(20).then(function (e) { self.spawn(); });
        };

        self.spawn = function () {
         /*   var spawnpoint = App.GameEngine.getSpawnPoint();

            self.sprite.x = spawnpoint.x;
            self.sprite.y = spawnpoint.y;
            self.sprite.frame = 0;

            self.health(100);

            App.GameEngine.Stage.removeChild(self.sprite);
            App.GameEngine.Stage.removeChild(self.nameLabel);

            App.GameEngine.Stage.addChild(self.sprite);
            App.GameEngine.Stage.addChild(self.nameLabel);

            self.physics = new App.Physics(self, 32, 32);

            self.sprite.addEventListener('enterframe', self.update);

            self.alive = true;*/
        };
    }

