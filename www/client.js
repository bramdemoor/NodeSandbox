console.log('Connecting...');
var socket = io.connect();
console.log('Connected. Sending ping...');
socket.on('ping', function(data) {
    console.log('Ping from server received. Sending pong...');
    var seq = data["seq"];
    socket.emit('pong', { seq: seq + 1 });
    console.log('Pong sent.');
});