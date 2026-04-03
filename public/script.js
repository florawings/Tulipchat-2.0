const socket = io();
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatDisplay = document.getElementById('chat-messages');

// Sidebar logic
menuBtn.onclick = () => sidebar.classList.add('active');
closeBtn.onclick = () => sidebar.classList.remove('active');

// Send Message
sendBtn.onclick = () => {
    if (msgInput.value.trim() !== "") {
        socket.emit('chat message', { text: msgInput.value, user: 'Me' });
        appendMessage({ text: msgInput.value, user: 'Me' });
        msgInput.value = "";
    }
};

function appendMessage(data) {
    const div = document.createElement('div');
    div.className = `msg ${data.user === 'Me' ? 'sent' : 'received'}`;
    div.innerText = data.text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

socket.on('chat message', (data) => {
    if(data.user !== 'Me') appendMessage(data);
});
