var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var log4js = require('log4js');
var logger = log4js.getLogger();
var fs = require('fs');
var SocketIOFileUpload = require('socketio-file-upload');

var port = 8000;

logger.debug('Script started');

server.listen(port);

app.use(express.static(__dirname));

var users = [];
var messages = [];

io.on('connection', function (socket) {
    var userId = (socket.id).toString().substr(1,4);

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
                messageBlock.userNickname = users[i].userNickname;
                if (users[i].photoPath != undefined) {
                    messageBlock.photoPath = users[i].photoPath;
                }
            }
        }

        messages.push(messageBlock);

        io.emit('messageToUsers', messageBlock);
    });

    socket.on('disconnect', function () {
        var userName;
        for (var i=0; i < users.length; i++) {
            if (userId === users[i].id) {
                userName = users[i].userName;

                users.splice(i, 1);
            }
        }
        io.emit('userDisconnect', userName);
    });

    var uploader = new SocketIOFileUpload();
    uploader.dir = __dirname + '/images';
    uploader.listen(socket);

    uploader.on("saved", function (event) {
        var userNickName,
            photoPath = 'images/' + event.file.name;

        for (var i=0; i < users.length; i++) {
            if (userId === users[i].id) {
                userNickName = users[i].userNickname;
                users[i].photoPath = 'images/' + event.file.name;
            }
        }

        socket.emit('savePhoto', photoPath);
        io.emit('saveUserPhotoToUsers', userNickName, photoPath);
    });

    uploader.on("error", function (event) {
        logger.info('Error!!!', event);
    });
});

