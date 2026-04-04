const socket = io();
const msgInput = document.getElementById('msg-input');
const chatBox = document.getElementById('chat-box');

// 1. Sidebar Toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// 2. Emoji Picker
const picker = new EmojiButton({ theme: 'dark' });
const trigger = document.querySelector('#emoji-trigger');

picker.on('emoji', selection => {
    msgInput.value += selection;
});

trigger.addEventListener('click', () => picker.togglePicker(trigger));

// 3. Send Message
function sendMessage() {
    const val = msgInput.value.trim();
    if(!val) return;
    socket.emit('chat-msg', { type: 'text', content: val, user: 'Ravindra' });
    msgInput.value = '';
}

// 4. File Upload (Gallery)
function handleFileUpload(input) {
    const file = input.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            socket.emit('chat-msg', { type: 'image', content: e.target.result, user: 'Ravindra' });
        };
        reader.readAsDataURL(file);
    }
}

// 5. Receive Message
socket.on('new-msg', (data) => {
    const div = document.createElement('div');
    div.className = `msg ${data.user === 'Ravindra' ? 'me' : ''}`;
    
    if(data.type === 'text') {
        div.innerHTML = `<b>${data.user}:</b><br>${data.content}`;
    } else {
        div.innerHTML = `<b>${data.user}:</b><br><img src="${data.content}" style="max-width:100%; border-radius:8px;">`;
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Update Users
socket.on('update-users', (users) => {
    document.getElementById('status').innerText = `${users.length} Online`;
});

// Enter Key support
msgInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
