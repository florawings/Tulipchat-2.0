const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

/* STORAGE */
let users = [];
let messages = [];

/* AUTO DELETE AFTER 10 HOURS */
function addMessage(msg){
messages.push(msg);

setTimeout(()=>{
messages.shift();
}, 36000000); // 10 hours
}

/* SOCKET */
io.on("connection", (socket) => {

console.log("User connected");

/* JOIN */
socket.on("join", (username) => {
socket.username = username;

if(!users.includes(username)){
users.push(username);
}

io.emit("users", users);

/* SEND OLD MSG */
socket.emit("oldMessages", messages);
});

/* MESSAGE */
socket.on("msg", (data) => {

if(data.text === "/clear"){
messages = [];
io.emit("clear");
return;
}

addMessage(data);

io.emit("msg", data);
});

/* DM */
socket.on("dm", (data) => {
io.emit("dm", data);
});

/* DISCONNECT */
socket.on("disconnect", () => {
users = users.filter(u => u !== socket.username);
io.emit("users", users);
});

});

/* ROUTES FIX */
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/chat", (req, res) => {
res.sendFile(path.join(__dirname, "public", "chat.html"));
});

/* START */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
