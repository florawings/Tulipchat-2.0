const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const onlineUsers = {};

io.on("connection", (socket) => {

console.log("User connected");

socket.on("join", (username) => {
onlineUsers[socket.id] = username;
io.emit("users", Object.values(onlineUsers));
});

socket.on("chat message", (data) => {
io.emit("chat message", data);
});

socket.on("typing", (username) => {
socket.broadcast.emit("typing", username);
});

socket.on("disconnect", () => {
delete onlineUsers[socket.id];
io.emit("users", Object.values(onlineUsers));
});

});

http.listen(process.env.PORT || 3000, () => {
console.log("Server running");
});
