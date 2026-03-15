const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const User = require("./models/User")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

const OWNER = "Lord_lucifer"
const SUPERADMIN = "Garima"

let onlineUsers = []

io.on("connection",(socket)=>{

const ip = socket.handshake.address

socket.on("join",(data)=>{

socket.username = data.username
socket.gender = data.gender
socket.role = data.role

onlineUsers.push({
id:socket.id,
username:data.username,
gender:data.gender,
role:data.role,
ip:ip
})

io.emit("onlineUsers",onlineUsers)

})

socket.on("message",(data)=>{

if(data.msg === "/clear"){

if(data.role==="owner" || data.role==="superadmin"){
io.emit("clearChat")
}

return
}

io.emit("message",data)

})

socket.on("blockUser",async(data)=>{

await User.updateOne(
{username:data.blocker},
{$push:{blocked:data.target}}
)

})

socket.on("disconnect",()=>{

onlineUsers = onlineUsers.filter(u=>u.id !== socket.id)

io.emit("onlineUsers",onlineUsers)

})

})

/* ADMIN DATA */

app.get("/admin/users",async(req,res)=>{

const users = await User.find()

res.json(users)

})

http.listen(3000,()=>{

console.log("Server running")

})
