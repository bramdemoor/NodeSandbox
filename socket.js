var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    var state = {
        sequence: Math.floor(Math.random() * (2 << 16)),
        remain: 10,
        time: null
    };

    var id = setInterval(function() {
        if (state.remain === 0) {
            clearInterval(id);
            return;
        }

        state.time = new Date();
        socket.emit('ping', { seq: state.sequence });
        state.remain -= 1;
    }, 1000);

    socket.on('pong', receivePing.bind(null, state));
});

function receivePing (state, data) {
    var clientSeq = data["seq"];
    if (clientSeq != state.sequence + 1 || state.time === null) {
        dropPingReceive(state);
        return;
    }

    var currentTime = new Date();
    var diff = currentTime.getTime() - state.time.getTime();

    console.log("Received packet with RTT of %d ms", diff);

    state.sequence += 2;
    state.time = null;
}

function dropPingReceive (state) {
    console.warn("Dropped packet with number %d", state.sequence);
}
