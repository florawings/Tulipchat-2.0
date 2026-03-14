const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http);

app.use(express.static("public"));

let users = {};

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[socket.id] = data

io.emit("system",data.name+" joined the chat")

io.emit("users",users)

})

socket.on("message",(data)=>{

io.emit("message",data)

})

socket.on("image",(data)=>{

io.emit("image",data)

})

socket.on("gif",(data)=>{

io.emit("gif",data)

})

socket.on("leave",(name)=>{

delete users[socket.id]

io.emit("system",name+" left the chat")

io.emit("users",users)

})

socket.on("disconnect",()=>{

delete users[socket.id]

io.emit("users",users)

})

})

const PORT = process.env.PORT || 10000

http.listen(PORT,()=>{

console.log("Tulip Chat running")

})
