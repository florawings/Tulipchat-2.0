const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))
app.use(express.json())

let onlineUsers = []
let mutedUsers = []
let bannedUsers = []

const OWNER = "Lord_lucifer"
const SUPER_ADMIN = "Garima"

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username = data.username

socket.role = "user"

if(data.username === OWNER){
socket.role="owner"
}

if(data.username === SUPER_ADMIN){
socket.role="superadmin"
}

onlineUsers.push({
id:socket.id,
username:data.username,
role:socket.role
})

io.emit("onlineUsers",onlineUsers)

io.emit("system",data.username+" joined the chat")

})

/* MESSAGE */

socket.on("message",(data)=>{

if(bannedUsers.includes(data.username)){
socket.disconnect()
return
}

if(mutedUsers.includes(data.username)){
socket.emit("system","You are muted")
return
}

if(data.msg === "/clear"){

if(socket.role==="owner" || socket.role==="superadmin"){
io.emit("clearChat")
}

return
}

io.emit("message",{
username:data.username,
role:socket.role,
msg:data.msg
})

})

/* BAN */

socket.on("banUser",(target)=>{

if(socket.role!=="owner" && socket.role!=="superadmin") return

bannedUsers.push(target)

io.emit("system",target+" banned")

})

/* MUTE */

socket.on("muteUser",(target)=>{

if(socket.role!=="owner" && socket.role!=="superadmin") return

mutedUsers.push(target)

io.emit("system",target+" muted")

})

/* KICK */

socket.on("kickUser",(target)=>{

if(socket.role!=="owner" && socket.role!=="superadmin") return

onlineUsers.forEach(u=>{

if(u.username===target){
io.to(u.id).disconnectSockets()
}

})

})

socket.on("disconnect",()=>{

onlineUsers = onlineUsers.filter(u=>u.id !== socket.id)

io.emit("onlineUsers",onlineUsers)

})

})

http.listen(3000,()=>{

console.log("Tulip Chat Server Running")

})
