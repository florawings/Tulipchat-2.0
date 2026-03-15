const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let users = {}
let blocked = {}

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

users[socket.id] = username

io.emit("users",Object.values(users))
io.emit("onlineCount",Object.keys(users).length)

io.emit("chat message",{
type:"system",
text: username + " joined chat"
})

})

socket.on("chat message",(data)=>{
io.emit("chat message",data)
})

socket.on("dm",(data)=>{

let target = Object.keys(users).find(
id => users[id] === data.to
)

if(target){
io.to(target).emit("dm",data)
}

})

socket.on("friend request",(data)=>{

let target = Object.keys(users).find(
id => users[id] === data.to
)

if(target){
io.to(target).emit("friend request",data)
}

})

socket.on("send gift",(data)=>{
io.emit("gift",data)
})

socket.on("disconnect",()=>{

let username = users[socket.id]

delete users[socket.id]

io.emit("users",Object.values(users))
io.emit("onlineCount",Object.keys(users).length)

if(username){
io.emit("chat message",{
type:"system",
text: username + " left chat"
})
}

})

})

server.listen(process.env.PORT || 3000)
