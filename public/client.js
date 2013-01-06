App = {};
App.socket = io.connect();

$(function() {

    App.Model = new App.ViewModelObj();

    ko.applyBindings(App.Model);

    App.Model.offlineMode(false);

    App.socket.on('joinSuccess', function() {
        App.Model.inGame = true;
        console.log('Succesfully joined!');
    });

    App.socket.on('playerInfo', function(data) {
        App.Model.updatePlayers(data);
    });

    App.GameEngine.initialize();

    $.getJSON('activeLevel', function(data) {
        App.GameEngine.start(data);
    });
});

