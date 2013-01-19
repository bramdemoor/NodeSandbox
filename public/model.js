$(function() {

    App.ViewModelObj = function () {
        var self = this;

        var nameSuggestions = ['Brutus', 'Sniper', 'Destroyer', 'Razorblade','Incisor','Garfield','Fons','Jefke','Jupiter', 'Poseidon', 'Dragon'];
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
            App.socket.emit('join', { name: self.localPlayerName() });
        };
        self.playerShoots = function(data) {
            new App.Bullet(data.x, data.y, data.dir);
        };
        self.updatePlayers = function(players) {
            for(var i = 0; i<players.length; i++) {
                var foundPlayer = false;
                for(var j = 0; j<self.characters().length; j++) {
                    if(self.characters()[j].name === players[i].name) {
                        self.characters()[j].serverUpdate(players[i]);
                        foundPlayer = true;
                    }
                }
                if(foundPlayer == false) {
                    var newCh = new App.PlayerCharacter(players[i].name);
                    newCh.serverUpdate(players[i]);
                    if(newCh.name === self.localPlayerName()) {
                        self.currentPlayer(newCh);
                        newCh.isLocal(true);
                    }
                    self.characters.push(newCh);
                    newCh.spawn();
                }
            }
        };
    };
});

