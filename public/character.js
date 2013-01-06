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
            self.nameLabel.x = self.physics.getX() - 2;
            self.nameLabel.y = self.physics.getY() - 20;

            self.scrollView();
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
            self.sprite.frame = 0;

            App.GameEngine.Stage.addChild(self.sprite);
            App.GameEngine.Stage.addChild(self.nameLabel);

            self.sprite.addEventListener('enterframe', self.update);
        };
    }
});
