const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use(express.json())

/* OWNER CONFIG */

const OWNER_NAME = "Lord_lucifer"
const OWNER_PASSWORD = "766521"

const SUPER_ADMIN = "Garima"

let onlineUsers = []

/* LOGIN API */

app.post("/login",(req,res)=>{

const {username,password,age,gender} = req.body

let role = "user"

/* OWNER CHECK */

if(username === OWNER_NAME){

if(password === OWNER_PASSWORD){

role = "owner"

}else{

return res.json({error:"Wrong owner password"})

}

}

/* SUPER ADMIN */

if(username === SUPER_ADMIN){

role = "superadmin"

}

res.json({

username,
role,
age,
gender

})

})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username = data.username
socket.role = data.role
socket.gender = data.gender

onlineUsers.push({

id:socket.id,
username:data.username,
role:data.role,
gender:data.gender

})

/* JOIN MESSAGE */

io.emit("message",{
system:true,
text:data.username+" joined the chat"
})

io.emit("users",onlineUsers)

})

/* MESSAGE */

socket.on("chat",(msg)=>{

io.emit("message",{
username:socket.username,
role:socket.role,
text:msg
})

})

/* CLEAR COMMAND */

socket.on("chat",(msg)=>{

if(msg === "/clear" && socket.role === "owner"){

io.emit("clear")

}

})

socket.on("disconnect",()=>{

onlineUsers = onlineUsers.filter(u=>u.id !== socket.id)

io.emit("users",onlineUsers)

})

})

server.listen(3000,()=>{

console.log("TulipChat running")

})
