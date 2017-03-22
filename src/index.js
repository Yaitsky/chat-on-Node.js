require('./styles.css');

var port = 8000;
var socket = io.connect('http://localhost:' + port);

var chatList = document.querySelector('#chatList');
var sendButton = document.querySelector('#send');
var textInput = document.querySelector('#text');

socket.on('userName', function (userName) {
    var newItem = document.createElement('li');
    newItem.innerText = "Your username is " + userName;
    chatList.appendChild(newItem);
});

socket.on('newUser', function (userName) {
    var newItem = document.createElement('li');
    newItem.innerText = "New user! His name is " + userName;
    chatList.appendChild(newItem);
});

sendButton.addEventListener('click', function (e) {
    e.preventDefault();
    var message = textInput.value;

    socket.emit('message', message);
    textInput.value = '';
});

socket.on('messageToClients', function (message, name) {
    var newItem = document.createElement('li');
    newItem.innerText = name + ": ---- " + message;

    chatList.appendChild(newItem);
});

socket.on('disconnect', function (name) {
    var newItem = document.createElement('li');
    newItem.innerText = name + ' disconnected';

    chatList.appendChild(newItem);
})







