const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

// STATIC FILES
app.use(express.static(__dirname + "/public"));

// DEFAULT ROUTE (MOST IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

// SOCKET
let users = [];

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;
    users.push(username);
    io.emit("users", users);
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u !== socket.username);
    io.emit("users", users);
  });

});

http.listen(PORT, () => console.log("Server running"));
