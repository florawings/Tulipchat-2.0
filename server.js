const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))
app.use(express.json())

let users = {}
let messages = []   // chat history

io.on("connection",(socket)=>{

// JOIN CHAT
socket.on("join",(data)=>{

users[socket.id] = data.name

// send old messages
socket.emit("history",messages)

// broadcast join message
let joinMsg = {
user:"System",
msg:data.name + " joined the chat"
}

messages.push(joinMsg)

io.emit("message",joinMsg)

io.emit("online",users)

})

// PUBLIC MESSAGE
socket.on("message",(data)=>{

messages.push(data)

if(messages.length>100){
messages.shift()
}

io.emit("message",data)

})

// DM
socket.on("dm",(data)=>{

io.to(data.to).emit("dm",data)

})

// DISCONNECT
socket.on("disconnect",()=>{

let name = users[socket.id]

delete users[socket.id]

io.emit("online",users)

if(name){

let leaveMsg={
user:"System",
msg:name + " left the chat"
}

messages.push(leaveMsg)

io.emit("message",leaveMsg)

}

})

})

http.listen(3000,()=>{
console.log("Server running")
})
