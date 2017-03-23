// require('./styles.css');
// require('socket.io');

var port = 8000;
var socket = io.connect('http://localhost:' + port);

var loginWindow = document.querySelector('#loginModal');
var loginButton = document.querySelector('#loginButton');

var userNameBlock = document.querySelector('.user-name--white');

var userList = document.querySelector('.users-list');
var usersCount = document.querySelector('#usersCount');

var sendButton = document.querySelector('.send-button');
var messageInput = document.querySelector('#message');

var chatList = document.querySelector('.chat-list');

function getTime() {
    var Data = new Date();
    var hours = Data.getHours();
    var minutes = Data.getMinutes();
    var seconds = Data.getSeconds();

    var time = hours + ':' + minutes + ':' + seconds;

    return time;
}

loginButton.addEventListener('click', function (e) {
    e.preventDefault();

    var userName = document.querySelector('#name').value;
    var userNickname = document.querySelector('#nickName').value;
    var user = {
        userName: userName,
        userNickname: userNickname
    }

    userNameBlock.innerText = userName;

    socket.emit('loginUser', user);

    loginWindow.style.display = 'none';
    document.querySelector('#name').value = '';
    document.querySelector('#nickName').value = '';
});

socket.on('newUser', function (users) {
    var usersNum = users.length;
    userList.innerHTML = '';

    for (var i = 0; i < users.length; i++) {
        var user = document.createElement('li');
        user.classList.add('users-list__item');
        user.textContent = users[i].userName;
        userList.appendChild(user);
    }

    usersCount.textContent = '(' + usersNum + ')';
});

sendButton.addEventListener('click', function (e) {
    e.preventDefault();

    var messageText = messageInput.value;

    var message = {
        message: messageText,
        date: getTime()
    }

    socket.emit('message', message);

    messageInput.value = '';
});

messageInput.addEventListener('keydown', function (e) {
    var messageText = messageInput.value;
    if (e.keyCode === 13) {
        var message = {
            message: messageText,
            date: getTime()
        }

        socket.emit('message', message);

        messageInput.value = '';
    }
});

socket.on('messageToUsers', function (messageBlock) {
    var template = document.querySelector('#message-template');
    var messageItem = template.content.cloneNode(true);

    messageItem.querySelector('.user-name').innerText = messageBlock.userName;
    messageItem.querySelector('.data-text').innerText = messageBlock.date;
    messageItem.querySelector('.message-text').innerText = messageBlock.message;

    chatList.appendChild(messageItem);

    chatList.scrollTop = chatList.scrollHeight - chatList.offsetHeight;
});


// socket.on('disconnect', function (name) {
//     var newItem = document.createElement('li');
//     newItem.innerText = name + ' disconnected';
//
//     chatList.appendChild(newItem);
// })







