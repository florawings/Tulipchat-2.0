const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const bcrypt = require("bcryptjs")

const User = require("./models/User")

app.use(express.json())
app.use(express.static("public"))

let onlineUsers=[]

/* REGISTER */

app.post("/register",async(req,res)=>{

const {username,age,gender,email,password}=req.body

let exist = await User.findOne({username})

if(exist){

return res.json({msg:"Username already exists"})

}

const hash = await bcrypt.hash(password,10)

await User.create({

username,
age,
gender,
email,
password:hash

})

res.json({msg:"registered"})

})

/* LOGIN */

app.post("/login",async(req,res)=>{

const {username,password}=req.body

const user = await User.findOne({username})

if(!user){

return res.json({msg:"User not found"})
}

const ok = await bcrypt.compare(password,user.password)

if(!ok){

return res.json({msg:"Wrong password"})
}

res.json({

msg:"login success",

username:user.username,
role:user.role,
gender:user.gender

})

})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username=data.username
socket.role=data.role

onlineUsers.push({

id:socket.id,
username:data.username,
role:data.role

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
