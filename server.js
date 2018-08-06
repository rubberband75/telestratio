var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
users = [];
connections = [];
games = [];

app.use(express.static('client'));
server.listen(process.env.PORT || 4000);
console.log('Server running...');


io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // New Game
    socket.on('new game', function (data, callback) {
        var gameName = shortid.generate().substring(0, 6).toUpperCase(); // "game" + games.length
        var game = { name: gameName, users: [socket], usernames: [], messages: [] }
        games.push(game)
        socket.game = game

        socket.emit('game joined', gameName);
    })

    // Join Game
    socket.on('join game', function (data) {
        var game = games.find(x => x.name === data);
        if (game) {
            socket.game = game
            socket.game.users.push(socket)
            socket.emit('game found', socket.game.name);
            retrieveMessages();
            
        } else {
            socket.emit('game not found');
        }
    });

    // New User
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        socket.game.usernames.push(socket.username);
        updateUsernames();
        if(socket.game.users.length >= 3) allowGameStart(socket.game);
    })

    // Disconnect
    socket.on('disconnect', function (data) {
        if (socket.game) socket.game.usernames.splice(socket.game.usernames.indexOf(socket.username), 1);

        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        if (socket.game) socket.game.users.splice(socket.game.users.indexOf(socket), 1);
        console.log('Dissconnected: %s sockets connected', connections.length);
    });

    // Send Message
    socket.on('send message', function (data) {
        if (socket.game) {
            for (var i = 0; i < socket.game.users.length; i++) {
                var msg = { msg: data, user: socket.username, type: 'txt' };
                socket.game.messages.push(msg);
                socket.game.users[i].emit('new message', msg);
            }
        }
    })

    // Send Drawing
    socket.on('send drawing', function (data) {
        if (socket.game) {
            for (var i = 0; i < socket.game.users.length; i++) {
                var msg = { msg: data, user: socket.username, type: 'img' };
                socket.game.messages.push(msg);
                socket.game.users[i].emit('new message', msg);
            }
        }
    })

    function allowGameStart(game){
        for (var i = 0; i < game.users.length; i++) {
            game.users[i].emit('allow start');
        }
    }

    function retrieveMessages() {
        if (socket.game) {
            for (var i = 0; i < socket.game.messages.length; i++) {
                socket.emit('new message', socket.game.messages[i]);
            }
        }
    }

    function updateUsernames() {
        if (socket.game) {
            for (var i = 0; i < socket.game.users.length; i++) {
                socket.game.users[i].emit('get users', socket.game.usernames);
            }
        }
    }
});