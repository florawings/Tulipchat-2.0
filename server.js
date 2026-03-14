const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

users[socket.id] = name

io.emit("system", name+" joined the chat")

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

io.emit("system",name+" left the chat")

delete users[socket.id]

io.emit("users",users)

})

socket.on("disconnect",()=>{

delete users[socket.id]

io.emit("users",users)

})

})

const PORT = process.env.PORT || 10000

http.listen(PORT,()=>{

console.log("Server running on "+PORT
