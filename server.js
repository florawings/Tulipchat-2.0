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

socket.on("join",(username)=>{

users[socket.id] = username

io.emit("online",Object.values(users))

io.emit("system",username+" joined the chat")

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

io.emit("online",Object.values(users))

if(user){

io.emit("system",user+" left the chat")

}

})

})

server.listen(PORT,()=>{

console.log("Server running on port "+PORT)

})
