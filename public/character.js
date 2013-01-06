$(function() {
    App.PlayerCharacter = function(name) {
        var self = this;

        self.name = name;
        self.sprite = new Sprite(32, 32);
        self.sprite.image = App.GameEngine.Game.assets['../img/chara1.gif'];
        self.nameLabel = new Label(self.name);
        self.pose = 0;
        self.physics = new App.Physics(self, 32, 32);

        self.update = function() {
            self.physics.update(self.sprite.x, self.sprite.y);
            self.sprite.x = self.physics.getX();
            self.sprite.y = self.physics.getY();
            self.updateAnimationFrame();
        };

        self.updateAnimationFrame = function() {
            if (self.physics.goalx > 0) self.sprite.scaleX = 1;
            if (self.physics.goalx < 0) self.sprite.scaleX = -1;

            if (self.physics.goalx != 0) {
                if (self.sprite.frame % 3 == 0) {
                    self.pose++;
                    self.pose %= 2;
                }
                self.sprite.frame = self.pose + 1;
            } else {
                self.sprite.frame = 0;
            }
        };

        self.onJump = function() {
            App.GameEngine.Game.assets['../wav/jump.wav'].clone().play();
        };

        self.onCollideLeft = function() {
            //
        };

        self.onCollideRight = function() {
            //
        };

        self.onCollideTop = function() {
            //
        };

        self.onCollideFloor = function(crossing, boundary) {
            if (App.GameEngine.Map.checkTile(crossing, boundary) == 10) {
                // Spikes!!!
                // self.die();
            }
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
