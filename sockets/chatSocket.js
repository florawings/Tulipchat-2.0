const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = await User.findById(socket.userId);
      if (!user || user.isBanned) return;
      if (user.isMuted) return socket.emit('error_msg', 'You are muted!');

      const msg = data.message;
      if (msg.startsWith('/') && (user.role === 'owner' || user.role === 'admin')) {
        const [cmd, target] = msg.split(' ');
        
        if (cmd === '/ban') await User.findOneAndUpdate({username: target}, {isBanned: true});
        if (cmd === '/mute') await User.findOneAndUpdate({username: target}, {isMuted: true});
        if (cmd === '/clear') io.emit('clear_chat');
        if (cmd === '/promote') await User.findOneAndUpdate({username: target}, {role: 'admin'});
        if (cmd === '/kick') io.emit('sys_message', `${target} kicked.`); // Kick logic

        io.emit('sys_message', `Action ${cmd} performed on ${target}`);
        return;
      }

      io.emit('newMessage', {
        text: msg,
        user: user.username,
        role: user.role,
        time: new Date().toLocaleTimeString()
      });
    } catch (e) { console.log(e); }
  });
};
