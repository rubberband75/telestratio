var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
games = [];

server.listen(process.env.PORT || 4000);
console.log('Server running...');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // New Game
    socket.on('new game', function(data, callback){
        var gameName = "game" + games.length
        var game = {name: gameName, users:[socket], usernames:[]}
        games.push(game)
        socket.game = game
        
        socket.emit('game joined', gameName);
    })

    // Join Game
    socket.on('join game', function(data){
        var game = games.find(x => x.name === data);
        if(game){
            socket.game = game
            socket.game.users.push(socket)
            socket.emit('game found', socket.game.name);
        } else {
            socket.emit('game not found');
        }
    });

    // New User
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        socket.game.usernames.push(socket.username);
        updateUsernames();
    })

    // Disconnect
    socket.on('disconnect', function(data){
        if(socket.game) socket.game.usernames.splice(socket.game.usernames.indexOf(socket.username), 1);

        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        if(socket.game) socket.game.users.splice(socket.game.users.indexOf(socket), 1);        
        console.log('Dissconnected: %s sockets connected', connections.length);
    });

    // Send Message
    socket.on('send message', function(data){
        for(var i = 0; i <  socket.game.users.length; i++){
            socket.game.users[i].emit('new message', {msg: data, user: socket.username});
        }
    })

    function updateUsernames(){
        if(socket.game){
            for(var i = 0; i <  socket.game.users.length; i++){
                socket.game.users[i].emit('get users', socket.game.usernames);
            }
        }
    }
});