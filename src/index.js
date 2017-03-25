// require('./socket.io');
// require('./client');
// require('./styles.css');

var port = 8000;
var socket = io.connect('http://localhost:' + port);
var siofu = new SocketIOFileUpload(socket);

var loginWindow = document.querySelector('#loginModal');
var loginButton = document.querySelector('#loginButton');

var userNameBlock = document.querySelector('.user-name--white');
var userPhoto = document.querySelector('#userPhoto');

var userList = document.querySelector('.users-list');
var usersCount = document.querySelector('#usersCount');

var sendButton = document.querySelector('.send-button');
var messageInput = document.querySelector('#message');

var chatList = document.querySelector('.chat-list');

var loadImageWindow = document.querySelector('#dndModal');
var cancelButton = document.querySelector('#cancelButton');
var loadButton = document.querySelector('#loadButton');
var dropBlock = document.querySelector('#dropBlock');
var dropBlockText = document.querySelector('#dropBlock span');
var filePhoto = document.querySelector('#filePhoto');
var userPhotoImage = document.querySelector('#userPhotoImage');
var maxFileSize = 512000;
var fileFormat = 'image/jpeg';

function getTime() {
    var Data = new Date();
    var hours = Data.getHours();
    var minutes = Data.getMinutes();
    var seconds = Data.getSeconds();

    if (hours.length < 2) {
        hours = '0' + hours;
    }

    if (minutes.length < 2) {
        minutes = '0' + minutes;
    }

    if (seconds.length < 2) {
        seconds = '0' + seconds;
    }

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

    if (messageBlock.photoPath != undefined) {
        messageItem.querySelector('.user-logo').setAttribute('src', messageBlock.photoPath);
    }

    messageItem.querySelector('.message').dataset.nickname = messageBlock.userNickname;
    messageItem.querySelector('.user-name').innerText = messageBlock.userName;
    messageItem.querySelector('.data-text').innerText = messageBlock.date;
    messageItem.querySelector('.message-text').innerText = messageBlock.message;

    chatList.appendChild(messageItem);

    chatList.scrollTop = chatList.scrollHeight - chatList.offsetHeight;
});

socket.on('userDisconnect', function (userName) {
    var users = userList.children;
    for (var i = 0; i < users.length; i++) {
        if (users[i].innerText == userName) {
            userList.removeChild(users[i]);
        }
    }
});

cancelButton.addEventListener('click', function (e) {
    e.preventDefault();
    loadImageWindow.style.display = 'none';

    if (filePhoto.files.length < 1) {
        userPhotoImage.setAttribute('src', '');
        userPhotoImage.style.display = 'none';
        dropBlock.classList.remove('error');
        dropBlock.classList.remove('drop');
        dropBlockText.innerText = 'Перетащите сюда фото';
    }
});

userPhoto.addEventListener('click', function () {
    loadImageWindow.style.display = 'block';
});

if (typeof(window.FileReader) == 'undefined') {
    dropBlock.classList.add('error');
    dropBlock.innerText = 'Не поддерживается браузером';
}

filePhoto.addEventListener('change', handleImage, false);

dropBlock.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropBlock.classList.remove('error');
    dropBlockText.innerText = 'Перетащите сюда фото';
    dropBlock.classList.add('hover');
    return false;
});

dropBlock.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropBlock.classList.remove('hover');
    return false;
});

function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function (e) {
        userPhotoImage.setAttribute('src', e.target.result);
        userPhotoImage.style.display = 'block';

    }
    reader.readAsDataURL(e.target.files[0]);
}

dropBlock.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();

    delete filePhoto.files[0];

    var files = e.dataTransfer.files;

    if (files[0] > maxFileSize || files[0].type != fileFormat) {
        dropBlock.classList.remove('hover');
        dropBlock.classList.add('error');
        dropBlockText.innerText = 'Ошибка! Размер файла более 512кб или тип файла не jpeg';
    } else {
        dropBlock.classList.remove('hover');
        dropBlock.classList.add('drop');
        dropBlockText.innerText = '';
        filePhoto.files = files;
    }
});

loadButton.addEventListener('click', function (e) {
    e.preventDefault();
    if (filePhoto.files.length < 1) {
        dropBlock.classList.add('error');
        dropBlockText.innerText = 'Ошибка! Не выбран файл';
    } else {
        loadImageWindow.style.display = 'none';
    }
});

siofu.listenOnSubmit(loadButton, filePhoto);
siofu.addEventListener("complete", function(event){
    console.log(event.success);
    console.log(event.file);
});

socket.on('savePhoto', function (photoPath) {
    userPhoto.setAttribute('src', photoPath);
});

socket.on('saveUserPhotoToUsers', function (userNickName, photoPath) {
    var messageItems = chatList.children;

    for (var i=0; i < messageItems.length; i++) {
        var messageItem = messageItems[i].querySelector('.message');
        var messagePhoto = messageItem.previousElementSibling;

        if (messageItem.dataset.nickname === userNickName) {
            messagePhoto.setAttribute('src', photoPath);
        }
    }
});
