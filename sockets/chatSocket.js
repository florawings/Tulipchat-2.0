module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User Connected:', socket.id);

        socket.on('join', (data) => {
            // Data check taaki undefined na aaye
            socket.username = data.username || "Guest";
            socket.role = data.role || "user";
            console.log(`${socket.username} joined as ${socket.role}`);
        });

        socket.on('sendMessage', (payload) => {
            // "undefined" fix: payload se message nikalne ka pakka tarika
            const messageText = payload.text || payload.msg || "";
            
            if (messageText.trim() !== "" || payload.type === 'image') {
                io.emit('newMessage', {
                    user: socket.username,
                    text: messageText,
                    type: payload.type || 'text',
                    role: socket.role,
                    time: new Date().toLocaleTimeString()
                });
            }
        });

        // Admin Action: Ban ya Alert ke liye
        socket.on('adminAction', (data) => {
            if (data.type === 'broadcast') {
                io.emit('newMessage', {
                    user: 'SYSTEM-ALERT',
                    text: data.message,
                    type: 'system'
                });
            }
            // Yahan ban logic bhi add kar sakte hain
        });
    });
};
