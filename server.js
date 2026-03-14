const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

const path = require("path")

app.use(express.static(path.join(__dirname,"public")))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

users[socket.id] = name

io.emit("system", name+" joined the chat")

io.emit("users",users)

})

socket.on("message",(data)=>{

io.emit("message",{
name:data.name,
text:data.text
})

})

socket.on("image",(data)=>{

io.emit("image",{
name:data.name,
url:data.url
})

})

socket.on("gif",(data)=>{

io.emit("gif",{
name:data.name,
url:data.url
})

})

socket.on("dm",(data)=>{

io.to(data.to).emit("dm",{
name:data.name,
text:data.text
})

})

socket.on("typing",(data)=>{

io.to(data.to).emit("typing",data.name)

})

socket.on("seen",(data)=>{

io.to(data.to).emit("seen",data.name)

})

socket.on("disconnect",()=>{

let name = users[socket.id]

if(name){

io.emit("system",name+" left the chat")

delete users[socket.id]

io.emit("users",users)

}

})
