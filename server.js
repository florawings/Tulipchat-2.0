const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
const MONGO_URI = "mongodb+srv://epfportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mrighsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Message Schema
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  image: String,
  type: String,
  to: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", messageSchema);

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

let onlineUsers = {};

// socket connection
io.on("connection", (socket) => {

  socket.on("join", async (username) => {

    socket.username = username;
    onlineUsers[socket.id] = username;

    io.emit("onlineUsers", Object.values(onlineUsers));

    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    socket.emit("chatHistory", messages);

    io.emit("message", {
      username: "System",
      message: username + " joined the chat"
    });

  });

  socket.on("sendMessage", async (data) => {

    const msg = new Message({
      username: data.username,
      message: data.message,
      image: data.image || "",
      type: data.type || "public",
      to: data.to || ""
    });

    await msg.save();

    if (data.type === "dm") {

      for (let id in onlineUsers) {
        if (onlineUsers[id] === data.to || onlineUsers[id] === data.username) {
          io.to(id).emit("message", msg);
        }
      }

    } else {
      io.emit("message", msg);
    }

  });

  socket.on("disconnect", () => {

    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];

    io.emit("onlineUsers", Object.values(onlineUsers));

    if (username) {
      io.emit("message", {
        username: "System",
        message: username + " left the chat"
      });
    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
