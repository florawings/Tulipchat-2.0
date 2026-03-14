const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const path = require("path")

app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"))
})

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

users[socket.id] = name

io.emit("system", name + " joined the chat")

io.emit("users", users)

})

socket.on("message",(data)=>{

io.emit("message", data)

})

socket.on("image",(data)=>{

io.emit("image", data)

})

socket.on("gif",(data)=>{

io.emit("gif", data)

})

socket.on("dm",(data)=>{

io.to(data.to).emit("dm",{
from:data.name,
text:data.text
})

})

socket.on("disconnect",()=>{

let name = users[socket.id]

delete users[socket.id]

io.emit("system", name + " left the chat")

io.emit("users", users)

})

})

const PORT = process.env.PORT || 10000

http.listen(PORT,()=>{

console.log("server running")

})
