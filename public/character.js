$(function() {
    App.PlayerCharacter = function(name) {
        var self = this;

        self.name = name;
        self.sprite = new Sprite(32, 32);
        self.sprite.image = App.GameEngine.Game.assets['../img/chara1.gif'];
        self.nameLabel = new Label(self.name);

        // Custom sprite ext
        self.pose = 0;

        // Movement
        self.goalx = 0;
        self.goaly = 0;
        self.incx = 0;
        self.incy = 0;
        self.jumpBoost = 0;
        self.jumping = false;

        self.getHorizontalFriction = function() {
            var friction = 0;
            if (self.incx > 0.3) {
                friction = -0.3;
            } else if (self.incx > 0) {
                friction = -self.incx;
            }
            if (self.incx < -0.3) {
                friction = 0.3;
            } else if (self.incx < 0) {
                friction = -self.incx;
            }
            return friction;
        };

        self.jump = function() {
            self.jumpBoost = 5;
            self.goaly = -5;
            App.GameEngine.Game.assets['../wav/jump.wav'].clone().play();
        };

        self.update = function() {
            var map = App.GameEngine.Map;

            var friction = self.getHorizontalFriction();

            if (self.jumping) {
                if (!App.GameEngine.Game.input.up || --self.jumpBoost < 0) {
                    self.goaly = 0;
                }
            } else {
                if (App.GameEngine.Game.input.up) {
                    self.jump();
                }
            }
            this.ax = 0;
            if (App.GameEngine.Game.input.left) self.goalx -= 0.5;
            if (App.GameEngine.Game.input.right) self.goaly += 0.5;
            if (self.goalx > 0) self.sprite.scaleX = 1;
            if (self.goalx < 0) self.sprite.scaleX = -1;
            if (self.goalx != 0) {
                if (self.sprite.frame % 3 == 0) {
                    self.pose++;
                    self.pose %= 2;
                }
                self.sprite.frame = self.pose + 1;
            } else {
                self.sprite.frame = 0;
            }
            self.incx += self.goalx + friction;
            self.incy += self.goaly + 2; // 2 is gravity
            self.incx = Math.min(Math.max(self.incx, -10), 10);
            self.incy = Math.min(Math.max(self.incy, -10), 10);

            var dest = new App.GameEngine.Rectangle(self.sprite.x + self.incx + 5, self.sprite.y + self.incy + 2, self.sprite.width - 10, self.sprite.height - 2);

            self.jumping = true;
            if (dest.x < -App.GameEngine.Stage.x) {
                dest.x = -App.GameEngine.Stage.x;
                self.incx = 0;
            }
            while (true) {

                var boundary, crossing;
                var centerx = dest.x - self.sprite.x - 5;
                var centery = dest.y - self.sprite.y - 2;

                if (centerx > 0 && Math.floor(dest.right / 16) != Math.floor((dest.right - centerx) / 16)) {

                    boundary = Math.floor(dest.right / 16) * 16;
                    crossing = (dest.right - boundary) / centerx * centery + dest.y;

                    if (self.hitTestRight(boundary, crossing, dest)) {
                        self.incx = 0;
                        dest.x = boundary - dest.width - 0.01;
                        continue;
                    }

                } else if (centerx < 0 && Math.floor(dest.x / 16) != Math.floor((dest.x - centerx) / 16)) {

                    boundary = Math.floor(dest.x / 16) * 16 + 16;
                    crossing = (boundary - dest.x) / centerx * centery + dest.y;

                    if ((map.hitTest(boundary - 16, crossing) && !map.hitTest(boundary, crossing)) || (map.hitTest(boundary - 16, crossing + dest.height) && !map.hitTest(boundary, crossing + dest.height))) {
                        // hit left
                        self.incx = 0;
                        dest.x = boundary + 0.01;
                        continue;
                    }
                }
                if (centery > 0 && Math.floor(dest.bottom / 16) != Math.floor((dest.bottom - centery) / 16)) {
                    boundary = Math.floor(dest.bottom / 16) * 16;
                    crossing = (dest.bottom - boundary) / centery * centerx + dest.x;
                    if ((map.hitTest(crossing, boundary) && !map.hitTest(crossing, boundary - 16)) || (map.hitTest(crossing + dest.width, boundary) && !map.hitTest(crossing + dest.width, boundary - 16))) {

                        // player is standing on floor
                        self.jumping = false;
                        self.incy = 0;
                        dest.y = boundary - dest.height - 0.01;

                        if (map.checkTile(crossing, boundary) == 10) {
                            // Spikes!!!
                            self.die();
                            return;
                        }

                        continue;
                    }
                } else if (centery < 0 && Math.floor(dest.y / 16) != Math.floor((dest.y - centery) / 16)) {
                    boundary = Math.floor(dest.y / 16) * 16 + 16;
                    crossing = (boundary - dest.y) / centery * centerx + dest.x;
                    if ((map.hitTest(crossing, boundary - 16) && !map.hitTest(crossing, boundary)) || (map.hitTest(crossing + dest.width, boundary - 16) && !map.hitTest(crossing + dest.width, boundary))) {
                        // player hit his head while jumping
                        self.incy = 0;
                        dest.y = boundary + 0.01;
                        continue;
                    }
                }

                break;
            }

            // Is this the offset?
            self.sprite.x = dest.x - 5;
            self.sprite.y = dest.y - 2;
        };

        self.spawn = function (spawnpoint) {
            self.sprite.x = spawnpoint.x;
            self.sprite.y = spawnpoint.y;
            self.nameLabel.x = spawnpoint.x - 2;
            self.nameLabel.y = spawnpoint.y - 20;
            self.sprite.frame = 0;

            App.GameEngine.Stage.addChild(self.sprite);
            App.GameEngine.Stage.addChild(self.nameLabel);

            self.sprite.addEventListener('enterframe', self.update);
        };
    }
});
