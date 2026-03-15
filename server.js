const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use('/uploads', express.static('uploads'))

let users = {}

io.on("connection",(socket)=>{

console.log("connected",socket.id)

socket.on("join",(username)=>{

users[socket.id] = username

io.emit("users",Object.values(users))

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

socket.emit("dm",data)

})

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

server.listen(process.env.PORT || 3000,()=>{
console.log("server running")
})
