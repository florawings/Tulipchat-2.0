const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[socket.id] = {
name:data.name,
type:data.type
}

})

socket.on("message",(msg)=>{

let user = users[socket.id]

if(!user) return

io.emit("message",{
user:user.name,
type:user.type,
text:msg
})

})

socket.on("disconnect",()=>{
delete users[socket.id]
})

})

http.listen(3000,()=>{
console.log("Server running")
})
