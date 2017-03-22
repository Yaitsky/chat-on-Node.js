var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var log4js = require('log4js');
var logger = log4js.getLogger();

var port = 8000;

logger.debug('Script started');

server.listen(port);

app.use(express.static(__dirname + '/src'));

io.on('connection', function (socket) {
    var name = "ID" + (socket.id).toString().substr(1,4);

    socket.broadcast.emit('newUser', name);
    socket.emit('userName', name);
    logger.info(name + ' connected to chat');

    socket.on('message', function (message) {
        logger.info(message);
        io.emit('messageToClients', message, name);
    });

    socket.on('disconnect', function (disc) {
        logger.info(name + ' disc');
        io.emit('disconnect', name);
    })
});