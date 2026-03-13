const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.join(data.room)

users[socket.id] = data.username

io.to(data.room).emit("chat message",{
user:"SYSTEM",
msg:data.username + " joined the room"
})

})

socket.on("chat message",(data)=>{

io.to(data.room).emit("chat message",data)

})

socket.on("disconnect",()=>{

let username = users[socket.id]

delete users[socket.id]

io.emit("users",Object.values(users))

})

})

http.listen(process.env.PORT || 3000,()=>{
console.log("Server running")
})
