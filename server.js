const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

let users = {};
let messages = [];

// 10 hours auto delete
setInterval(() => {
  const now = Date.now();
  messages = messages.filter(m => now - m.time < 10*60*60*1000);
}, 60000);

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;
    users[username] = socket.id;

    socket.emit("oldMessages", messages);
    io.emit("onlineUsers", Object.keys(users));
  });

  socket.on("message", (msg) => {

    if(msg === "/clear"){
      messages = [];
      io.emit("clearChat");
      return;
    }

    const data = { text: msg, time: Date.now() };
    messages.push(data);
    io.emit("message", data);
  });

  socket.on("image", (img) => {
    const data = { img, time: Date.now() };
    messages.push(data);
    io.emit("message", data);
  });

  socket.on("dm", ({to, msg}) => {
    const id = users[to];
    if(id){
      io.to(id).emit("dm", {
        from: socket.username,
        msg
      });
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.username];
    io.emit("onlineUsers", Object.keys(users));
  });

});

server.listen(process.env.PORT || 3000);
