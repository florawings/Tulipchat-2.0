module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New User Connected: ' + socket.id);

        // Join Global Room
        socket.join('global_room');

        // 1. Global Message Logic
        socket.on('send-global-msg', (data) => {
            io.to('global_room').emit('receive-global-msg', {
                user: data.user,
                text: data.text,
                time: new Date().toLocaleTimeString()
            });
        });

        // 2. Private DM Logic
        socket.on('send-private-msg', ({ toUserId, message, fromUser }) => {
            // Sirf us specific user ko bhejna
            socket.to(toUserId).emit('receive-private-msg', {
                from: fromUser,
                text: message,
                senderId: socket.id
            });
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected');
        });
    });
};
