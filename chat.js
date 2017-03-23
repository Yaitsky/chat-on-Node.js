var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var log4js = require('log4js');
var logger = log4js.getLogger();

var port = 8000;

logger.debug('Script started');

server.listen(port);

app.use(express.static(__dirname));

var users = [];
var messages = [];

io.on('connection', function (socket) {
    var userId = (socket.id).toString().substr(1,4)

    socket.on('loginUser', function (user) {
        var userData = user;
        userData.id = userId;

        var nickNameList = [];
        for (var i = 0; i < users.length; i++) {
            nickNameList.push(users[i].userNickname);
        }

        if (nickNameList.indexOf(userData.userNickname) < 0) {
            users.push(userData);
        }

        io.emit('newUser', users);
        logger.info(users);
    });

    socket.on('message', function (message) {
        var messageBlock = message;
        for (var i=0; i < users.length; i++) {
            if (userId === users[i].id) {
                messageBlock.userName = users[i].userName;
            }
        }

        messages.push(messageBlock);

        io.emit('messageToUsers', messageBlock);
        logger.info(messages);
    });
});

// var name = "ID" + (socket.id).toString().substr(1,4);
//
// socket.broadcast.emit('newUser', name);
// socket.emit('userName', name);
// logger.info(name + ' connected to chat');
//
// socket.on('message', function (message) {
//     logger.info(message);
//     io.emit('messageToClients', message, name);
// });
//
// socket.on('disconnect', function (disc) {
//     logger.info(name + ' disc');
//     io.emit('disconnect', name);
// })