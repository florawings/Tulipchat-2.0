const express = require("express")
const app = express()

const http = require("http").createServer(app)
const { Server } = require("socket.io")

const io = new Server(http)

app.use(express.static("public"))

let users = {}
let messages = []   // chat history

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[socket.id] = data

socket.emit("history",messages)   // old messages send

io.emit("system",data.name+" joined the chat")

io.emit("users",users)

})

socket.on("message",(data)=>{

messages.push({type:"text",data:data})

io.emit("message",data)

})

socket.on("image",(data)=>{

messages.push({type:"image",data:data})

io.emit("image",data)

})

socket.on("gif",(data)=>{

messages.push({type:"gif",data:data})

io.emit("gif",data)

})

socket.on("leave",(name)=>{

delete users[socket.id]

io.emit("system",name+" left the chat")

io.emit("users",users)

})

socket.on("disconnect",()=>{

delete users[socket.id]

io.emit("users",users)

})

})

const PORT = process.env.PORT || 10000

http.listen(PORT,()=>{

console.log("Tulip Chat running")

})
