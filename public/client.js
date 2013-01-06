App = {};
App.socket = io.connect();

$(function() {

    App.socket.on('draw', function() {
        console.log('response received!');
    });

    App.Model = new App.ViewModelObj();

    ko.applyBindings(App.Model);

    App.Model.offlineMode(false);

    App.GameEngine.initialize();

    $.getJSON('activeLevel', function(data) {
        App.GameEngine.start(data);
    });
});

