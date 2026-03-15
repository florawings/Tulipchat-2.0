const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}   // username -> socket id
let userRoom = {} // socket -> room

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[data.username] = socket.id
userRoom[socket.id] = data.room

socket.join(data.room)

io.to(data.room).emit("system",data.username+" joined "+data.room)

updateOnline()

})

socket.on("message",(data)=>{

io.to(data.room).emit("message",data)

})

/* DM MESSAGE */

socket.on("dm",(data)=>{

let target = users[data.to]

if(target){

io.to(target).emit("dm",data)

}

})

socket.on("disconnect",()=>{

for(let u in users){

if(users[u] === socket.id){

delete users[u]

}

}

delete userRoom[socket.id]

updateOnline()

})

})

function updateOnline(){

io.emit("online",Object.keys(users))

}

http.listen(3000)
