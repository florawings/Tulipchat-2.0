const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let users = {};
let messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;

    io.emit("users", Object.values(users));
    socket.emit("oldMessages", messages);
  });

  socket.on("msg", (data) => {
    messages.push(data);
    io.emit("msg",
