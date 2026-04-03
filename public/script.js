const socket = io();
const menuBtn = document.getElementById('menu-btn');
const closeSidebar = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatDisplay = document.getElementById('chat-messages');

// Sidebar toggle
menuBtn.onclick = () => sidebar.classList.add('active');
closeSidebar.onclick = () => sidebar.classList.remove('active');

// Send Logic
sendBtn.onclick = () => {
    const text = msgInput.value.trim();
    if (text) {
        socket.emit('chat message', { text: text, user: 'Me' });
        appendMsg({ text: text, user: 'Me' });
        msgInput.value = '';
    }
};

function appendMsg(data) {
    const div = document.createElement('div');
    div.className = `msg ${data.user === 'Me' ? 'sent' : 'received'}`;
    div.innerText = data.text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

socket.on('chat message', (data) => {
    if (data.user !== 'Me') appendMsg(data);
});
