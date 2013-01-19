$(function() {
    App.PlayerCharacter = function(name) {
        var self = this;

        self.name = name;
        self.sprite = new Sprite(32, 32);
        self.sprite.image = App.GameEngine.Game.assets['../img/chara1.gif'];
        self.nameLabel = new Label(self.name);
        self.pose = 0;
        self.physics = undefined;
        self.alive = false;
        self.isLocal = ko.observable(false);
        self.score = ko.observable(0);
        self.health = ko.observable(100);

        // controls
        self.upPressed = false;
        self.leftPressed = false;
        self.rightPressed = false;

        self.syncCounter = 0;

        self.serverUpdate = function(src) {
            self.score(src.score);
            self.health(src.health);
            self.upPressed = src.upPressed;
            self.leftPressed = src.leftPressed;
            self.rightPressed = src.rightPressed;

            if(self.physics) {
                self.physics.serverUpdate(src.x, src.y, src.incx, src.incy);
            }
        };

        self.update = function() {

            var inputChanged = false;
            if(self.isLocal()) {
                inputChanged = self.handleKeys();
            }

            if(!self.alive) return;

            self.physics.update(self.upPressed, self.leftPressed, self.rightPressed);
            self.sprite.x = self.physics.getX();
            self.sprite.y = self.physics.getY();
            self.nameLabel.x = self.physics.getX() - 2;
            self.nameLabel.y = self.physics.getY() - 20;

            if(self.isLocal()) {
                if(self.sprite.y > 320 || self.health() < 1) {
                    self.die();
                }

                self.scrollView();

                App.socket.emit('moved', {
                    upPressed : self.upPressed,
                    leftPressed : self.leftPressed,
                    rightPressed : self.rightPressed
                });
            }
        };

        self.handleKeys = function() {
            var inputChanged = false;
            if(self.upPressed != App.GameEngine.Game.input.up) {
                self.upPressed = App.GameEngine.Game.input.up;
                inputChanged = true;
            }
            if(self.leftPressed != App.GameEngine.Game.input.left) {
                self.leftPressed = App.GameEngine.Game.input.left;
                inputChanged = true;
            }
            if(self.rightPressed != App.GameEngine.Game.input.right) {
                self.rightPressed = App.GameEngine.Game.input.right;
                inputChanged = true;
            }
            return inputChanged;
        };

        self.onWantsToMove = function() {
            self.sprite.scaleX = self.physics.goalDir == 0 ? self.sprite.scaleX : self.physics.goalDir;

            if (self.physics.goalDir != 0) {
                if (App.GameEngine.Game.frame % 3 == 0) {
                    self.pose++;
                    self.pose %= 2;
                }
                self.sprite.frame = self.pose + 1;
            } else {
                self.sprite.frame = 0;
            }
        };

        self.scrollView = function() {
            var cut = 128;
            if (App.GameEngine.Stage.x > cut - self.sprite.x) {
                App.GameEngine.Stage.x = cut - self.sprite.x;
            } else if (App.GameEngine.Stage.x < cut - self.sprite.x) {
                App.GameEngine.Stage.x = cut - self.sprite.x;
            }
        };

        self.onJump = function() {
            App.GameEngine.Game.assets['../wav/jump.wav'].clone().play();
        };

        self.onCollideLeft = function() { };

        self.onCollideRight = function() { };

        self.onCollideTop = function() { };

        self.onCollideFloor = function(crossing, boundary) {
            if (App.GameEngine.Map.checkTile(crossing, boundary) == 10) {
                // Spikes!!!
                 self.die();
            }
        };

        self.shoot = function () {
            var dir = self.sprite.scaleX;
            var x = self.sprite.x + 10 + (25 * dir);
            var y = self.sprite.y + 10;
            new App.Bullet(x, y, dir);
            App.socket.emit('shoot', { name: self.name, x: x, y: y, dir: dir });
        };

        self.die = function () {
            self.health(0);

            self.alive = false;
            App.GameEngine.Game.assets['../wav/gameover.wav'].play();
            self.sprite.frame = 3;

            self.score(self.score() - 10);

            self.physics = undefined;   // Destroy this so it will be reset when spawning

            App.socket.emit('died', { });

            self.sprite.tl.delay(20).then(function (e) { self.spawn(); });
        };

        self.spawn = function () {
            var spawnpoint = App.GameEngine.getSpawnPoint();

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

            App.socket.emit('spawned', { });

            self.alive = true;
        };
    }
});
