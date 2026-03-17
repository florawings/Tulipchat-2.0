module.exports = (io) => {

  const users = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join with username
    socket.on("join", (username) => {
      users[username] = socket.id;
      socket.username = username;
      io.emit("onlineUsers", Object.keys(users));
    });

    // DM message
    socket.on("dm", ({ to, message }) => {
      const targetSocket = users[to];
      if (targetSocket) {
        io.to(targetSocket).emit("dm", {
          from: socket.username,
          message
        });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      delete users[socket.username];
      io.emit("onlineUsers", Object.keys(users));
    });
  });

};
