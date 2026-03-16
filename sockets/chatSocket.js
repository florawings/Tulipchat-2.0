const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = await User.findById(socket.userId);
      if (!user) return;

      // 1. Check if Banned
      if (user.isBanned) {
        return socket.emit('error_msg', 'Aapko is chat se ban kiya gaya hai.');
      }

      // 2. Check if Muted
      if (user.isMuted) {
        return socket.emit('error_msg', 'Aap abhi muted hain aur message nahi bhej sakte.');
      }

      // 3. Handle Admin Commands (e.g., /ban username)
      if (data.message.startsWith('/') && (user.role === 'owner' || user.role === 'admin')) {
        const parts = data.message.split(' ');
        const command = parts[0];
        const targetName = parts[1];

        if (command === '/ban' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { isBanned: true });
          return io.emit('sys_message', `${targetName} ko ${user.username} ne BAN kar diya hai.`);
        }
        
        if (command === '/unban' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { isBanned: false });
          return io.emit('sys_message', `${targetName} ko UNBAN kar diya gaya hai.`);
        }

        if (command === '/mute' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { isMuted: true });
          return io.emit('sys_message', `${targetName} ko MUTE kar diya gaya hai.`);
        }

        if (command === '/promote' && targetName) {
          await User.findOneAndUpdate({ username: targetName }, { role: 'admin' });
          return io.emit('sys_message', `${targetName} ko ADMIN bana diya gaya hai!`);
        }
      }

      // 4. Normal Message Distribution
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
        
