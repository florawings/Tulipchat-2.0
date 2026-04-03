const socket = io();

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const sendBtn = document.getElementById('send-btn');
const msgInput = document.getElementById('msg-input');
const chatDisplay = document.getElementById('chat-messages');

// Sidebar Toggle
menuBtn.onclick = () => sidebar.classList.toggle('active');

// Send Message
sendBtn.onclick = () => {
    if (msgInput.value.trim() !== "") {
        socket.emit('chat message', { text: msgInput.value, user: 'Me' });
        msgInput.value = "";
    }
};

// Receive Message
socket.on('chat message', (data) => {
    const div = document.createElement('div');
    div.classList.add('msg');
    div.classList.add(data.user === 'Me' ? 'sent' : 'received');
    div.innerText = data.text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight; // Auto scroll to bottom
});

