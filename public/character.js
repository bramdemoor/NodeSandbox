$(function() {
    App.PlayerCharacter = function(name) {
        var self = this;

        self.name = name;
        self.sprite = new Sprite(32, 32);
        self.sprite.image = App.GameEngine.Game.assets['../img/chara1.gif'];
        self.nameLabel = new Label(self.name);

        self.spawn = function (spawnpoint) {
            self.sprite.x = spawnpoint.x;
            self.sprite.y = spawnpoint.y;
            self.nameLabel.x = spawnpoint.x - 2;
            self.nameLabel.y = spawnpoint.y - 20;
            self.sprite.frame = 0;

            App.GameEngine.Stage.addChild(self.sprite);
            App.GameEngine.Stage.addChild(self.nameLabel);
        };
    }
});
