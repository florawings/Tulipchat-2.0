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

socket.on("join",(data)=>{

users[socket.id] = {
name: data.name,
avatar: data.avatar
}

io.emit("online",users)

io.emit("system",data.name+" joined the chat")

})

socket.on("message",(data)=>{

io.emit("message",data)

})

socket.on("image",(data)=>{

io.emit("image",data)

})

socket.on("typing",(name)=>{

socket.broadcast.emit("typing",name)

})

socket.on("dm",(data)=>{

io.to(data.to).emit("dm",data)

})

socket.on("disconnect",()=>{

let user = users[socket.id]

delete users[socket.id]

io.emit("online",users)

if(user){
io.emit("system",user.name+" left the chat")
}

})

})

server.listen(PORT,()=>{
console.log("Server running")
})
