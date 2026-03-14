const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.json())
app.use(express.static("public"))

let users = []        // registered users
let onlineUsers = {}  // online users


// REGISTER
app.post("/register",(req,res)=>{

let {username,password,country} = req.body

if(!username || !password){
return res.json({status:"error"})
}

let exist = users.find(u=>u.username===username)

if(exist){
return res.json({status:"user_exists"})
}

users.push({
username,
password,
country
})

res.json({status:"registered"})

})


// LOGIN
app.post("/login",(req,res)=>{

let {username,password} = req.body

let user = users.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({status:"invalid"})
}

res.json({status:"success"})

})


// SOCKET CHAT
io.on("connection",(socket)=>{

socket.on("join",(data)=>{

onlineUsers[socket.id]={
name:data.name,
type:data.type
}

})

socket.on("message",(msg)=>{

let user=onlineUsers[socket.id]

if(!user) return

io.emit("message",{
user:user.name,
type:user.type,
text:msg
})

})

socket.on("disconnect",()=>{
delete onlineUsers[socket.id]
})

})


http.listen(3000,()=>{
console.log("Server running")
})
