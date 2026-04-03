const socket = io();

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatDisplay = document.getElementById('chat-messages');

// Sidebar toggle (Open/Close on Click)
menuBtn.addEventListener('click', (e) => {
    sidebar.classList.toggle('active');
    e.stopPropagation();
});

// Close sidebar when clicking outside
document.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

// Send Message
sendBtn.onclick = () => {
    if (msgInput.value.trim() !== "") {
        const data = { text: msgInput.value, user: 'Me' };
        socket.emit('chat message', data);
        renderMessage(data);
        msgInput.value = "";
    }
};

function renderMessage(data) {
    const div = document.createElement('div');
    div.className = `msg ${data.user === 'Me' ? 'sent' : 'received'}`;
    div.innerText = data.text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

socket.on('chat message', (data) => {
    if(data.user !== 'Me') renderMessage(data);
});
