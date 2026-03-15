const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")
const path = require("path")

// database connect
require("./database")

const User = require("./models/User")

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
cors:{
origin:"*"
}
})

app.use(express.json())
app.use(express.static("public"))

let onlineUsers = {}

// register API
app.post("/api/register", async(req,res)=>{

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

// login API
app.post("/api/login", async(req,res)=>{

const {email,password} = req.body

const user = await User.findOne({email})

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


// realtime chat
io.on("connection",(socket)=>{

console.log("user connected:",socket.id)

socket.on("join",(username)=>{

onlineUsers[socket.id] = username

io.emit("onlineUsers",Object.values(onlineUsers))

io.emit("system",username + " joined chat")

})


socket.on("chat message",(data)=>{

io.emit("chat message",data)

})


socket.on("disconnect",()=>{

let username = onlineUsers[socket.id]

delete onlineUsers[socket.id]

if(username){

io.emit("system",username + " left chat")

}

io.emit("onlineUsers",Object.values(onlineUsers))

})

})


const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{

console.log("server running on port",PORT)

})
