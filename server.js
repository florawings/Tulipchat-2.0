const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = []

io.on("connection",(socket)=>{

socket.on("join",(user)=>{

socket.username = user
users.push(user)

io.emit("system","SYSTEM : " + user + " joined")

io.emit("users",users)

})

socket.on("chat",(data)=>{

let msg = data.user + " : " + data.text

io.emit("msg",msg)

})

socket.on("disconnect",()=>{

users = users.filter(u => u !== socket.username)

io.emit("users",users)

})

})

http.listen(3000,()=>{

console.log("Server running")

})
