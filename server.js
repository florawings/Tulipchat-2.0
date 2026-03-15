const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* USERS */

let users = {}

/* CONNECTION */

io.on("connection",(socket)=>{

console.log("user connected:",socket.id)

/* USER JOIN */

socket.on("join",(username)=>{

users[socket.id] = username

console.log(username,"joined")

/* UPDATE ONLINE USERS */

io.emit("users",Object.values(users))

/* JOIN MESSAGE */

io.emit("chat message",{
type:"system",
text: username + " joined chat"
})

})

/* PUBLIC MESSAGE */

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

/* PRIVATE MESSAGE */

socket.on("dm",(data)=>{

let targetSocket = Object.keys(users).find(
id => users[id] === data.to
)

if(targetSocket){

io.to(targetSocket).emit("dm",data)

}

/* sender ko bhi show */

socket.emit("dm",data)

})

/* DISCONNECT */

socket.on("disconnect",()=>{

let username = users[socket.id]

delete users[socket.id]

io.emit("users",Object.values(users))

if(username){

io.emit("chat message",{
type:"system",
text: username + " left chat"
})

}

})

})

server.listen(3000,()=>{
console.log("Server running on port 3000")
})
