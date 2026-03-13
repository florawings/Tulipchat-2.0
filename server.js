const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

console.log("User connected")

socket.on("join",(username)=>{

users[username] = socket.id

io.emit("users",Object.keys(users))

})

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

socket.on("private message",(data)=>{

let target = users[data.to]

if(target){

io.to(target).emit("private message",data)

}

})

socket.on("typing",(username)=>{

socket.broadcast.emit("typing",username)

})

socket.on("disconnect",()=>{

for(let name in users){

if(users[name] == socket.id){

delete users[name]

}

}

io.emit("users",Object.keys(users))

console.log("User disconnected")

})

})

http.listen(process.env.PORT || 3000,()=>{

console.log("Server running")

})
