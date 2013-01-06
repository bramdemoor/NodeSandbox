$(function() {

    App.GameEngine = {

        initialize: function() {
            enchant();

            enchant.Sound.enabledInMobileSafari = true;
            enchant.ENV.USE_WEBAUDIO = true;
            enchant.ENV.KEY_BIND_TABLE = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
            enchant.ENV.PREVENT_DEFAULT_KEY_CODES = [37, 38, 39, 40, 32];

            App.GameEngine.Game = new Game(640, 320);
            App.GameEngine.Game.fps = 30;
            App.GameEngine.Game.scale = 1;
            App.GameEngine.Game.preload('../img/map2.gif');
        },

        start: function(mapData) {
            console.log('Starting game with map ' + mapData.name);

            App.GameEngine.Game.onload = function () {
                var map = new Map(16, 16);
                map.image = App.GameEngine.Game.assets['../img/map2.gif'];
                map.loadData(mapData.blocks);
                var stage = new Group();
                stage.addChild(map);
                App.GameEngine.Game.rootScene.addChild(stage);
                App.GameEngine.Game.rootScene.backgroundColor = 'rgb(182, 255, 255)';
            };

            App.GameEngine.Game.start();
        }
    };

});

