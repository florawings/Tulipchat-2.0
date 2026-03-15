const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let users = []

io.on("connection",(socket)=>{

console.log("user connected")

// JOIN
socket.on("join",(username)=>{

socket.username = username
users.push(username)

io.emit("users",users)

io.emit("chat message",{
type:"system",
text: username + " joined chat"
})

})

// MESSAGE
socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

// DM
socket.on("dm",(data)=>{

io.emit("dm",data)

})

// TYPING
socket.on("typing",(name)=>{

socket.broadcast.emit("typing",name)

})

// DISCONNECT
socket.on("disconnect",()=>{

users = users.filter(u => u !== socket.username)

io.emit("users",users)

if(socket.username){

io.emit("chat message",{
type:"system",
text: socket.username + " left chat"
})

}

})

})

server.listen(3000,()=>{
console.log("server running")
})
