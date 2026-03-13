const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[data.username] = {
socket: socket.id,
room: data.room,
lastSeen: Date.now()
}

socket.join(data.room)

io.to(data.room).emit("chat message",{
user:"SYSTEM",
msg:data.username + " joined the room"
})

})

socket.on("chat message",(data)=>{

io.to(data.room).emit("chat message",data)

})

socket.on("disconnect",()=>{

for(let u in users){

if(users[u].socket === socket.id){

users[u].lastSeen = Date.now()

}

}

})

})

http.listen(3000)
