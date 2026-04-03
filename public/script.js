const socket = io();

// UI Elements
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');
const sendBtn = document.getElementById('send-btn');
const msgInput = document.getElementById('msg-input');
const chatDisplay = document.getElementById('chat-messages');
const userList = document.getElementById('users');
const countDisp = document.getElementById('count');

// Sidebar Open/Close
menuBtn.onclick = () => sidebar.classList.add('active');
closeBtn.onclick = () => sidebar.classList.remove('active');

// Send Message
sendBtn.onclick = () => {
    if (msgInput.value.trim() !== "") {
        const msgData = { text: msgInput.value, user: 'Me' };
        socket.emit('chat message', msgData);
        appendMessage(msgData); // Khud ka message turant dikhao
        msgInput.value = "";
    }
};

// Receive Message from Server
socket.on('chat message', (data) => {
    if(data.user !== 'Me') {
        appendMessage(data);
    }
});

function appendMessage(data) {
    const div = document.createElement('div');
    div.classList.add('msg');
    div.classList.add(data.user === 'Me' ? 'sent' : 'received');
    div.innerText = data.text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Update Online Users (Dummy list logic - connects to backend)
socket.on('update users', (users) => {
    countDisp.innerText = users.length;
    userList.innerHTML = users.map(u => `<li><i class="fas fa-circle" style="color:green"></i> ${u}</li>`).join('');
});
