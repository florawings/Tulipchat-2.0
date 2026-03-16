const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = await User.findById(socket.userId);
      if (!user) return;

      // 1. Permission Checks
      if (user.isBanned) return socket.emit('error_msg', 'Aap banned hain.');
      if (user.isMuted) return socket.emit('error_msg', 'Aap muted hain.');

      // 2. Admin & Owner Commands
      if (data.message.startsWith('/') && (user.role === 'owner' || user.role === 'admin')) {
        const parts = data.message.split(' ');
        const command = parts[0].toLowerCase();
        const targetName = parts[1];

        // --- NEW: KICK COMMAND ---
        if (command === '/kick' && targetName) {
          const targetSocket = [...io.sockets.sockets.values()].find(s => s.username === targetName);
          if (targetSocket) {
            targetSocket.disconnect();
            return io.emit('sys_message', `${targetName} ko room se kick kar diya gaya.`);
          }
        }

        // --- NEW: CLEAR COMMAND ---
        if (command === '/clear') {
          io.emit('clear_chat'); // Sabke screen se chat saaf ho jayegi
          return io.emit('sys_message', `Chat history ko ${user.username} ne clear kar diya.`);
        }

        // --- PURANI POWERS ---
        if (command === '/ban' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { isBanned: true });
          return io.emit('sys_message', `${targetName} ko hamesha ke liye BAN kar diya gaya.`);
        }

        if (command === '/mute' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { isMuted: true });
          return io.emit('sys_message', `${targetName} ko MUTE kar diya gaya.`);
        }

        if (command === '/promote' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { role: 'admin' });
          return io.emit('sys_message', `${targetName} ab ADMIN hai.`);
        }
      }

      // 3. Normal Message
      io.emit('newMessage', {
        text: data.message,
        user: user.username,
        role: user.role,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

    } catch (err) {
      console.error(err);
    }
  });
};
