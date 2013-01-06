App = {};
App.socket = io.connect();

$(function() {

    App.socket.on('draw', function() {
        console.log('response received!');
    });

    App.socket.emit('drawClick', { tester: 'Bram'});

    App.Model = new App.ViewModelObj();

    ko.applyBindings(App.Model);

    App.Model.offlineMode(false);
});

