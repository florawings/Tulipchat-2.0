const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
cors:{origin:"*"}
})

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

console.log("User connected")

socket.on("join",(data)=>{

users[socket.id] = data

io.emit("online",users)

io.emit("system", data.name + " joined the chat")

})

socket.on("message",(data)=>{

io.emit("message",data)

})

socket.on("image",(data)=>{

io.emit("image",data)

})

socket.on("disconnect",()=>{

let user = users[socket.id]

delete users[socket.id]

io.emit("online",users)

if(user){
io.emit("system", user.name + " left the chat")
}

})
