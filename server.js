const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

const User = require("./models/User")
const Message = require("./models/Message")

let onlineUsers = {}

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

onlineUsers[username] = socket.id

io.emit("onlineUsers",Object.keys(onlineUsers))

})

socket.on("chat message", async(data)=>{

try{

const msg = new Message({
username:data.username,
msg:data.msg
})

await msg.save()

io.emit("chat message",data)

}catch(err){
console.log(err)
}

})

socket.on("disconnect",()=>{

for(let user in onlineUsers){

if(onlineUsers[user] === socket.id){

delete onlineUsers[user]

}

}

io.emit("onlineUsers",Object.keys(onlineUsers))

})

})

app.post("/register",async(req,res)=>{

try{

const user = new User(req.body)

await user.save()

res.json({status:"ok"})

}catch(err){

res.json({status:"error"})

}

})

app.post("/login",async(req,res)=>{

const {email,password} = req.body

const user = await User.findOne({email,password})

if(user){

res.json({status:"ok",username:user.username})

}else{

res.json({status:"fail"})

}

})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{

console.log("Server running on",PORT)

})
