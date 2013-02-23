var socketio = require('socket.io')
    , guestNumber = 1
    , nickNames = {}
    , namesUsed = []
    , currentRoom = {};

exports.listen = function (server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        socket.join('Sprint');
        socket.on('card', function (card) {
            console.log(card);
            socket.emit('card', card);
        });
    });
};