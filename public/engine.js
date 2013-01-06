$(function() {

    App.GameEngine = {

        Rectangle: enchant.Class.create({
            initialize: function (x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            },
            right: { get: function () { return this.x + this.width; } },
            bottom: { get: function () { return this.y + this.height; } }
        }),

        initialize: function() {
            enchant();

            enchant.Sound.enabledInMobileSafari = true;
            enchant.ENV.USE_WEBAUDIO = true;
            enchant.ENV.KEY_BIND_TABLE = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
            enchant.ENV.PREVENT_DEFAULT_KEY_CODES = [37, 38, 39, 40, 32];

            App.GameEngine.Game = new Game(640, 320);
            App.GameEngine.Game.fps = 30;
            App.GameEngine.Game.scale = 1;
            App.GameEngine.Game.preload('../img/map2.gif', '../img/chara1.gif', '../wav/jump.wav', '../wav/gameover.wav');
        },

        getSpawnPoint : function () {
             return { x: 100, y: 100 };
        },

        start: function(mapData) {
            console.log('Starting game with map ' + mapData.name);

            App.GameEngine.Game.onload = function () {
                App.GameEngine.Map = new Map(16, 16);
                App.GameEngine.Map.image = App.GameEngine.Game.assets['../img/map2.gif'];
                App.GameEngine.Map.loadData(mapData.blocks);
                App.GameEngine.Stage = new Group();
                App.GameEngine.Stage.addChild(App.GameEngine.Map);
                App.GameEngine.Game.rootScene.addChild(App.GameEngine.Stage);
                App.GameEngine.Game.rootScene.backgroundColor = 'rgb(182, 255, 255)';
            };

            App.GameEngine.Game.start();
        }
    };

});

