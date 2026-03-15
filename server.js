const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
cors:{origin:"*"}
})

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

console.log("Connected:",socket.id)

/* JOIN */

socket.on("join",(username)=>{

users[socket.id] = username

io.emit("users",Object.values(users))

io.emit("chat message",{
type:"system",
text:username+" joined chat"
})

})

/* MESSAGE */

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

/* DM */

socket.on("dm",(data)=>{

let target = Object.keys(users).find(
id => users[id]===data.to
)

if(target){

io.to(target).emit("dm",data)

}

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
text:username+" left chat"
})

}

})

})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("Server running",PORT)
})
