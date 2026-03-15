const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const mongoose=require("mongoose")

require("./database")

const User=require("./models/User")

const app=express()

const server=http.createServer(app)

const io=new Server(server)

app.use(express.json())

app.use(express.static("public"))

let onlineUsers={}

app.post("/api/register",async(req,res)=>{

const {username,email,password}=req.body

const user=new User({

username,
email,
password

})

await user.save()

res.json({status:"registered"})

})

app.post("/api/login",async(req,res)=>{

const {email,password}=req.body

let user=await User.findOne({email})

if(!user){

return res.json({status:"no user"})

}

if(user.password!==password){

return res.json({status:"wrong password"})

}

res.json({

status:"ok",
username:user.username

})

})

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

onlineUsers[socket.id]=username

io.emit("onlineUsers",Object.values(onlineUsers))

})

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

socket.on("disconnect",()=>{

delete onlineUsers[socket.id]

io.emit("onlineUsers",Object.values(onlineUsers))

})

})

server.listen(3000,()=>{

console.log("server running")

})
