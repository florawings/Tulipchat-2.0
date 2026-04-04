const socket = io();
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const sidebar = document.getElementById('sidebar');

// 1. Sidebar Toggle
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

// 2. Emoji Picker Logic
const picker = new EmojiButton({ position: 'top-start', theme: 'dark' });
const emojiBtn = document.querySelector('#emoji-btn');

picker.on('emoji', selection => {
    msgInput.value += selection;
});

emojiBtn.addEventListener('click', () => picker.togglePicker(emojiBtn));

// 3. Send Text Message
function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;
    socket.emit('chat-msg', { type: 'text', content: text, user: 'Ravindra' });
    msgInput.value = '';
}

// 4. Send Image/GIF
function handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            socket.emit('chat-msg', { type: 'image', content: e.target.result, user: 'Ravindra' });
        };
        reader.readAsDataURL(file);
    }
}

// 5. Receive Messages
socket.on('new-msg', (data) => {
    const div = document.createElement('div');
    div.className = `msg ${data.user === 'Ravindra' ? 'me' : ''}`;
    
    let contentHtml = `<b>${data.user}</b>`;
    if (data.type === 'text') {
        contentHtml += `<span>${data.content}</span>`;
    } else {
        contentHtml += `<img src="${data.content}" class="chat-img" onclick="window.open(this.src)">`;
    }
    
    div.innerHTML = contentHtml;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// User List Update
socket.on('update-users', (users) => {
    document.getElementById('user-list').innerHTML = users.map(u => `<div class="user-item">${u}</div>`).join('');
    document.getElementById('status-text').innerText = `${users.length} Users Online`;
});

// Enter key to send
msgInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
