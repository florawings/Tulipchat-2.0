const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = await User.findById(socket.userId);
      if (!user) return;

      if (user.isBanned) return socket.emit('error_msg', 'Banned!');
      if (user.isMuted) return socket.emit('error_msg', 'Muted!');

      // Command Processor
      if (data.message.startsWith('/') && (user.role === 'owner' || user.role === 'admin')) {
        const [cmd, targetName] = data.message.split(' ');
        const command = cmd.toLowerCase();

        switch(command) {
          case '/ban':
            await User.findOneAndUpdate({ username: targetName }, { isBanned: true });
            io.emit('sys_message', `🛑 ${targetName} has been BANNED.`);
            break;
          case '/kick':
            // Logic to find socket by username and disconnect
            io.emit('sys_message', `👢 ${targetName} was kicked out.`);
            break;
          case '/clear':
            io.emit('clear_chat');
            io.emit('sys_message', `🧹 Chat cleared by ${user.username}`);
            break;
          case '/promote':
            await User.findOneAndUpdate({ username: targetName }, { role: 'admin' });
            io.emit('sys_message', `🛡️ ${targetName} is now an Admin.`);
            break;
        }
        return;
      }

      // Send Message to all
      io.emit('newMessage', {
        text: data.message,
        user: user.username,
        role: user.role,
        time: new Date().toLocaleTimeString()
      });
    } catch (e) { console.log(e); }
  });
};
