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

        };
    };
});

