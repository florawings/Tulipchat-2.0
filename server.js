const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

/* USERS STORE */
let users = {};

/* SOCKET CONNECTION */
io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  /* USER JOIN */
  socket.on("join", (username) => {

    users[socket.id] = username;

    console.log(username, "joined");

    /* SEND UPDATED USER LIST */
    io.emit("users", Object.values(users));

    /* SYSTEM MESSAGE */
    io.emit("chat message", {
      type: "system",
      text: username + " joined chat"
    });

  });

  /* PUBLIC MESSAGE */
  socket.on("chat message", (data) => {

    console.log("Message:", data);

    /* SEND TO ALL USERS */
    io.emit("chat message", data);

  });

  /* PRIVATE MESSAGE */
  socket.on("dm", (data) => {

    let targetSocket = Object.keys(users).find(
      id => users[id] === data.to
    );

    if (targetSocket) {
      io.to(targetSocket).emit("dm", data);
    }

    /* ALSO SHOW TO SENDER */
    socket.emit("dm", data);

  });

  /* USER DISCONNECT */
  socket.on("disconnect", () => {

    let username = users[socket.id];

    delete users[socket.id];

    io.emit("users", Object.values(users));

    if (username) {
      io.emit("chat message", {
        type: "system",
        text: username + " left chat"
      });
    }

    console.log("Disconnected:", socket.id);

  });

});

/* SERVER START */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
