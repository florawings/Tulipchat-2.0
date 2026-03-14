const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

const PORT = process.env.PORT || 3000

let users = {}

io.on("connection",(socket)=>{

console.log("user connected")

socket.on("joinRoom",(data)=>{

const {username,room} = data

socket.join(room)

users[socket.id] = {username,room}

io.to(room).emit("system",username+" joined the room")

})

socket.on("chatMessage",(data)=>{

io.to(data.room).emit("message",{
username:data.username,
message:data.message
})

})

socket.on("ownerKick",(user)=>{

io.emit("system",user+" was kicked by owner")

})

socket.on("ownerBan",(user)=>{

io.emit("system",user+" was banned by owner")

})

socket.on("ownerMute",(user)=>{

io.emit("system",user+" was muted by owner")

})

socket.on("disconnect",()=>{

const user = users[socket.id]

if(user){

io.to(user.room).emit("system",user.username+" left the room")

delete users[socket.id]

}

})

})

server.listen(PORT,()=>{

console.log("Server running on "+PORT)

})
