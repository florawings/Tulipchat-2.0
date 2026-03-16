module.exports = (io) => {
    let users = new Map();

    io.on('connection', (socket) => {
        socket.on('join', (data) => {
            socket.username = data.username;
            socket.role = data.role || 'user';
            users.set(socket.id, { id: socket.id, username: socket.username, role: socket.role });
            
            io.emit('updateAdminList', Array.from(users.values()));
            io.emit('newMessage', { user: 'System', text: `${socket.username} joined the heat!`, type: 'system' });
        });

        socket.on('sendMessage', (data) => {
            // Admin Check: Agar user banned hai toh message nahi jayega
            if (socket.isBanned) return socket.emit('error', 'You are banned from this room.');

            const msgPayload = {
                user: socket.username,
                role: socket.role,
                text: data.text,
                type: data.type || 'text',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            io.emit('newMessage', msgPayload);
        });

        // Admin Actions Handling
        socket.on('adminAction', (action) => {
            if (socket.role !== 'owner') return;

            if (action.type === 'ban') {
                const target = io.sockets.sockets.get(action.targetId);
                if (target) {
                    target.isBanned = true;
                    target.emit('newMessage', { user: 'System', text: 'You have been banned by Admin.', type: 'system' });
                    target.disconnect();
                }
            } else if (action.type === 'broadcast') {
                io.emit('newMessage', { user: 'ADMIN ALERT', text: action.message, role: 'owner' });
            }
        });

        socket.on('disconnect', () => {
            users.delete(socket.id);
            io.emit('updateAdminList', Array.from(users.values()));
        });
    });
};
