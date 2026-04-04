const socket = io();
const sidebar = document.getElementById('sidebar');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');

// 1. UI Controls
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function checkEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

// 2. Message Sending
function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;
    
    socket.emit('chat-msg', { type: 'text', content: text, user: 'Me' });
    msgInput.value = '';
}

// 3. Photo/GIF Gallery Logic
function handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            socket.emit('chat-msg', { 
                type: 'image', 
                content: e.target.result, 
                user: 'Me' 
            });
        };
        reader.readAsDataURL(file);
    }
}

// 4. Receiving Messages
socket.on('new-msg', (data) => {
    const div = document.createElement('div');
    div.className = `msg ${data.user === 'Me' ? 'me' : ''}`;
    
    let innerHTML = `<b>${data.user}</b>`;
    if (data.type === 'text') {
        innerHTML += `<span>${data.content}</span>`;
    } else {
        innerHTML += `<img src="${data.content}" class="chat-img" onclick="window.open(this.src)">`;
    }
    
    div.innerHTML = innerHTML;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// User list update logic
socket.on('update-users', (users) => {
    const list = document.getElementById('user-list');
    list.innerHTML = users.map(u => `<div class="user-item">${u}</div>`).join('');
});
