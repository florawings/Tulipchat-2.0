const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const User = require("./models/User")

app.use(express.json())
app.use(express.static("public"))

let onlineUsers=[]

/* REGISTER */

app.post("/register",async(req,res)=>{

const {username,age,gender,email}=req.body

let exist = await User.findOne({username})

if(exist){

return res.json({msg:"Username already exists"})

}

await User.create({

username,
age,
gender,
email

})

res.json({msg:"registered"})

})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username=data.username
socket.role=data.role

onlineUsers.push({

id:socket.id,
username:data.username

})

io.emit("onlineUsers",onlineUsers)

})

socket.on("message",(data)=>{

if(data.msg==="/clear"){

io.emit("clearChat")
return

}

io.emit("message",data)

})

socket.on("disconnect",()=>{

onlineUsers = onlineUsers.filter(u=>u.id!==socket.id)

io.emit("onlineUsers",onlineUsers)

})

})

http.listen(3000,()=>{

console.log("Server running")

})
