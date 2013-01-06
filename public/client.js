App = {};
App.socket = io.connect();

$(function() {

    App.socket.on('draw', function() {
        console.log('response received!');
    });

    $("#tester").click(function(e) {
        App.socket.emit('drawClick', { tester: 'Bram'});
    });

});

