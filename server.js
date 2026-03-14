const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.json())
app.use(express.static("public"))

const OWNER = {
username:"Lord_lucifer",
password:"766521",
role:"owner"
}

let users=[]
let rooms=["public"]
let onlineUsers={}

/* REGISTER */

app.post("/register",(req,res)=>{

let {username,password}=req.body

if(username===OWNER.username){
return res.json({status:"reserved"})
}

let exist=users.find(u=>u.username===username)

if(exist){
return res.json({status:"exists"})
}

users.push({
username,
password,
role:"user"
})

res.json({status:"registered"})

})

/* LOGIN */

app.post("/login",(req,res)=>{

let {username,password}=req.body

if(username===OWNER.username && password===OWNER.password){

return res.json({
status:"owner",
username:OWNER.username
})

}

let user=users.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({status:"invalid"})
}

res.json({
status:"success",
username:user.username,
role:user.role
})

})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

onlineUsers[socket.id]={
name:data.name
}

socket.join("public")

io.emit("system",data.name+" joined")

})

/* MESSAGE */

socket.on("message",(data)=>{

io.to(data.room).emit("message",{
user:data.user,
