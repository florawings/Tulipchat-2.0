const socket = io();
const chatArea = document.getElementById('chat-flow');

// Typing Indicator Feature
const typingStatus = document.getElementById('typing-status');
document.getElementById('main-input').addEventListener('input', () => {
    socket.emit('typing', { user: ME.name });
});

socket.on('displayTyping', (data) => {
    typingStatus.innerText = `${data.user} is typing...`;
    setTimeout(() => { typingStatus.innerText = ''; }, 2000);
});

// DM Notification Logic
socket.on('privatePing', (data) => {
    alert(`New Private Message from ${data.from}!`);
});
