// Backend Logic (Node.js)
io.on('connection', (socket) => {
    
    // 1. Global Message (Sabko dikhega)
    socket.on('send-global-msg', (data) => {
        io.emit('receive-global-msg', data); 
    });

    // 2. Private Message (Sirf recipient ko)
    socket.on('send-private-msg', ({ toUserId, message }) => {
        socket.to(toUserId).emit('receive-private-msg', {
            from: socket.id,
            message: message
        });
    });
});
