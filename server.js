const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.join(data.room)

users[data.username] = socket.id

io.emit("users",Object.keys(users))

})

socket.on("chat message",(data)=>{

io.to(data.room).emit("chat message",data)

})

socket.on("disconnect",()=>{

for(let name in users){

if(users[name]==socket.id){

delete users[name]

}

}

io.emit("users",Object.keys(users))

})

})

http.listen(process.env.PORT || 3000)
