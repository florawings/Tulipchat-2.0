const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb+srv://effportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mrighsb.mongodb.net/tulipchat?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  type: String,
  to: String,
  time: Date
});

const Message = mongoose.model("Message", messageSchema);

let users = {};

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("join", async (username) => {

    users[socket.id] = username;

    io.emit("onlineUsers", Object.values(users));

    io.emit("message", {
      user: "System",
      text: username + " joined chat",
      type: "system"
    });

    const oldMessages = await Message.find().sort({time:1}).limit(100);

    socket.emit("oldMessages", oldMessages);
  });

  socket.on("message", async (data) => {

    const msg = new Message({
      user: data.user,
      text: data.text,
      type: data.type || "text",
      time: new Date()
    });

    await msg.save();

    io.emit("message", msg);
  });

  socket.on("dm", async (data) => {

    const msg = new Message({
      user: data.from,
      text: data.text,
      type: "dm",
      to: data.to,
      time: new Date()
    });

    await msg.save();

    for (let id in users) {

      if (users[id] === data.to || users[id] === data.from) {

        io.to(id).emit("dm", msg);

      }

    }

  });

  socket.on("disconnect", () => {

    const username = users[socket.id];

    delete users[socket.id];

    io.emit("onlineUsers", Object.values(users));

    io.emit("message", {
      user: "System",
      text: username + " left chat",
      type: "system"
    });

  });

});

server.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
