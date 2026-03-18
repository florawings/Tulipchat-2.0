const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// IMPORTANT: static folder
app.use(express.static(path.join(__dirname, "public")));

// FIX: default route (warna "Cannot GET /" aata hai)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// SIMPLE SOCKET (no crash)
let users = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    users.push(username);
    io.emit("onlineUsers", users);
  });

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u !== socket.username);
    io.emit("onlineUsers", users);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
