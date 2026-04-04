// Kisi user par click karne par DM panel set karein
function openPrivateChat(userId, userName) {
    document.getElementById('dm-target-name').innerText = "Chat with " + userName;
    window.currentDMTarget = userId; // Target ID save karein
}

// Private message bhejne ka function
function sendPrivate() {
    const msg = document.getElementById('private-input').value;
    socket.emit('send-private-msg', {
        toUserId: window.currentDMTarget,
        message: msg
    });
}
