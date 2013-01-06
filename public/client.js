App = {};
App.socket = io.connect();

App.socket.on('draw', function(data) { console.log(data); });

$(function() {
    App.socket.emit('drawClick', { tester: 'Bram'});
});