const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const myUsername = urlParams.get('username');
const myGender = urlParams.get('gender') || 'Male';

socket.emit('join', { username: myUsername, gender: myGender });

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function handleUpload() {
    const file = document.getElementById('fileIn').files[0];
    const formData = new FormData();
    formData.append('chatFile', file);

    const xhr = new XMLHttpRequest();
    document.getElementById('upload-progress').style.display = 'block';

    xhr.upload.onprogress = (e) => {
        const p = Math.round((e.loaded / e.total) * 100);
        document.getElementById('bar').style.width = p + '%';
        document.getElementById('percent').innerText = p + '%';
    };

    xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        socket.emit('sendMessage', { message: res.url, type: 'file' });
        document.getElementById('upload-progress').style.display = 'none';
    };
    xhr.open('POST', '/upload');
    xhr.send(formData);
}

socket.on('newMessage', (data) => {
    const div = document.createElement('div');
    const avatar = data.gender === 'Female' ? '👩‍🦰' : '👨‍🦱';
    
    if(data.type === 'file') {
        div.innerHTML = `<b>${avatar} ${data.user}:</b><br><img src="${data.text}" style="max-width:200px; border-radius:10px;">`;
    } else {
        div.innerHTML = `<b>${avatar} ${data.user}:</b> ${data.text}`;
    }
    document.getElementById('messages').appendChild(div);
});

socket.on('updateUserList', (users) => {
    const list = document.getElementById('online-list');
    list.innerHTML = users.map(u => `
        <div class="user-item" onclick="sendDM('${u.username}')">
            ${u.gender === 'Female' ? '👩‍🦰' : '👨‍🦱'} ${u.username}
        </div>
    `).join('');
});

function sendDM(user) {
    if(user === myUsername) return;
    const m = prompt(`Private message to ${user}:`);
    if(m) socket.emit('privateMessage', { to: user, message: m });
}
