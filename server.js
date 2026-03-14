const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = []

io.on("connection",(socket)=>{

socket.on("join",(name)=>{
users.push(name)
io.emit("users",users)
})

socket.on("message",(data)=>{
io.emit("message",data)
})

socket.on("disconnect",()=>{
users = users.filter(u=>u!==socket.username)
io.emit("users",users)
})

})

http.listen(process.env.PORT || 3000,()=>{
console.log("Tulip Chat server running")
})
