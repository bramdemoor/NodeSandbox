$(function() {

    App.ViewModelObj = function () {
        var self = this;

        var nameSuggestions = ['Brutus', 'Sniper', 'Destroyer', 'Razorblade'];
        self.localPlayerName = ko.observable(nameSuggestions[Math.floor(Math.random() * nameSuggestions.length)]);
        self.inGame = ko.observable(false);
        self.inMenu = ko.computed(function () { return !self.inGame(); });
        self.offlineMode = ko.observable(true);
        self.characters = ko.observableArray([]);
        self.sortFunction = function (left, right) {
            return left.score() == right.score() ? 0 : (left.score() > right.score() ? -1 : 1);
        };
        self.sortedCharacters = ko.dependentObservable(function () {
            return self.characters.slice().sort(self.sortFunction);
        }, self);
        self.currentPlayer = ko.observable();
        self.editMode = ko.observable(false);
        self.isAdmin = ko.observable(true);
        self.logEntries = ko.observableArray(["Welcome!"]);
        self.hasPlayers = ko.computed(function () {
            return self.characters().length > 0;
        });
        self.join = function() {
            App.GameEngine.Player = new App.PlayerCharacter(self.localPlayerName());
            App.GameEngine.Player.spawn();
            App.socket.emit('join', { name: self.localPlayerName() });
        };
        self.updPlayer = function(src, dest) {
            dest.name = src.name;
            dest.x = src.x;
            dest.y = src.y;
            dest.isLocal = ko.observable(true);
            dest.score = ko.observable(0);
            dest.health = ko.observable(100);
            return dest;
        };
        self.updatePlayers = function(players) {
            for(var i = 0; i<players.length; i++) {
                var p = players[i];
                var foundPlayer = false;
                for(var j = 0; j<self.characters().length; j++) {
                    var ch = self.characters()[j];
                    if(ch.name === p.name) {
                        self.updPlayer(p,ch);
                        foundPlayer = true;
                    }
                }
                if(foundPlayer == false) {
                    self.characters.push(self.updPlayer(p,{ }));
                }
            }
        };
    };
});

