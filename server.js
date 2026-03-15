const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")

require("./database")

const User = require("./models/User")
const Message = require("./models/Message")

const app = express()
const server = http.createServer(app)

const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))

let onlineUsers = {}

/* ---------- REGISTER ---------- */

app.post("/api/register", async (req,res)=>{

try{

const {username,email,password} = req.body

const user = new User({
username,
email,
password
})

await user.save()

res.json({status:"ok"})

}catch(err){

res.json({status:"error"})

}

})

/* ---------- LOGIN ---------- */

app.post("/api/login", async (req,res)=>{

const {email,password} = req.body

let user = await User.findOne({email})

if(!user){
return res.json({status:"no user"})
}

if(user.password !== password){
return res.json({status:"wrong password"})
}

res.json({
status:"ok",
username:user.username
})

})

/* ---------- SOCKET ---------- */

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

onlineUsers[username] = socket.id

io.emit("onlineUsers",Object.keys(onlineUsers))

})

/* CHAT MESSAGE */

socket.on("chat message", async (data)=>{

let msg = new Message({
username:data.username,
msg:data.msg
})

await msg.save()

io.emit("chat message",data)

})

/* TYPING */

socket.on("typing",(username)=>{

socket.broadcast.emit("typing",username)

})

/* DM */

socket.on("dm",(data)=>{

let target = onlineUsers[data.to]

if(target){

io.to(target).emit("dm",data)

}

})

/* DISCONNECT */

socket.on("disconnect",()=>{

for(let user in onlineUsers){

if(onlineUsers[user] === socket.id){

delete onlineUsers[user]

}

}

io.emit("onlineUsers",Object.keys(onlineUsers))

})

})

server.listen(3000,()=>{
console.log("server running")
})
