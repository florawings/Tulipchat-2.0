const socket = io();

// Join Rooms
socket.emit('join-global');
const myId = "User_" + Math.floor(Math.random() * 1000); // Temporary ID

function sendGlobal() {
    const text = document.getElementById('global-input').value;
    if(!text) return;
    socket.emit('send-global', { user: "Ravindra", text: text });
    document.getElementById('global-input').value = "";
}

function sendPrivate() {
    const text = document.getElementById('private-input').value;
    // Example: Aap kisi specific ID pe bhej rahe ho
    socket.emit('send-private', { toId: "Target_ID", text: text, from: "Ravindra" });
    document.getElementById('private-input').value = "";
}

socket.on('receive-global', (data) => {
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<b>${data.user}:</b> ${data.text}`;
    document.getElementById('global-msgs').appendChild(msgDiv);
});

socket.on('receive-private', (data) => {
    const msgDiv = document.createElement('div');
    msgDiv.style.color = "#00ff88";
    msgDiv.innerHTML = `<b>[DM] ${data.from}:</b> ${data.text}`;
    document.getElementById('private-msgs').appendChild(msgDiv);
});
