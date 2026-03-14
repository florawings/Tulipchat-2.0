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

io.emit("chat",{
type:"join",
text:name+" joined the chat"
})

io.emit("users",users)

})

socket.on("message",(data)=>{

io.emit("chat",{
type:"text",
name:data.name,
text:data.text
})

})

socket.on("image",(data)=>{

io.emit("chat",{
type:"image",
name:data.name,
url:data.url
})

})

socket.on("gif",(data)=>{

io.emit("chat",{
type:"gif",
name:data.name,
url:data.url
})

})

socket.on("disconnect",()=>{

let name = users[socket.id]

if(name){

io.emit("chat",{
type:"left",
text:name+" left the chat"
})

delete users[socket.id]

io.emit("users",users)

}

})

})

const PORT = process.env.PORT || 10000

http.listen(PORT,()=>{
console.log("server running")
})
