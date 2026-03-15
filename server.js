const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* USERS STORE */

let users = {}

/* CONNECTION */

io.on("connection",(socket)=>{

console.log("connected:",socket.id)

/* JOIN */

socket.on("join",(username)=>{

users[socket.id] = username

/* SEND ONLINE USERS */

io.emit("users",Object.values(users))

/* JOIN MESSAGE */

io.emit("chat message",{
type:"system",
text: username + " joined chat"
})

})

/* PUBLIC MESSAGE */

socket.on("chat message",(data)=>{

/* BROADCAST TO EVERYONE */

io.emit("chat message",data)

})

/* PRIVATE DM */

socket.on("dm",(data)=>{

let targetId = Object.keys(users).find(
id => users[id] === data.to
)

if(targetId){

io.to(targetId).emit("dm",data)

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
console.log("server running")
})
