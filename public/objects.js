$(function() {

    App.Bullet = function Bullet(x, y, dir) {
        var self = this;
        self.sprite = new Sprite(16, 16);
        self.sprite.image = App.GameEngine.Game.assets['../img/icon0.png'];
        self.sprite.x = x;
        self.sprite.y = y;
        self.sprite.scaleX = -dir;
        self.sprite.frame = 62;

        self.destroy = function () {
            App.GameEngine.Stage.removeChild(self.sprite);
            self.sprite.removeEventListener('enterframe', arguments.callee);
        };
        self.update = function (evt) {
            if (App.GameEngine.Map.hitTest(self.sprite.x + 30, self.sprite.y + 2)) {
                self.destroy();
            }
        };
        self.sprite.on('enterframe', function () {
            if (App.Model.currentPlayer()) {
                if (self.sprite.intersect(App.Model.currentPlayer().sprite)) {
                    App.Model.currentPlayer().health(App.Model.currentPlayer().health() - 10);
                    self.destroy();
                }
            }
        });

        self.sprite.tl.moveBy(500 * dir, 0, 40).then(function (e) { self.destroy(); });
        self.sprite.addEventListener('enterframe', self.update);

        App.GameEngine.Stage.addChild(self.sprite);

        return this;
    }

});

