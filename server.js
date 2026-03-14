const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.json())
app.use(express.static("public"))

/* OWNER ACCOUNT */

const OWNER = {
username: "Lord_lucifer",
password: "766521",
email: "sharmaravindra515@gmail.com",
role: "owner"
}

/* USERS DATABASE */

let users = []

/* REGISTER */

app.post("/register",(req,res)=>{

let {username,password,country}=req.body

let exist = users.find(u=>u.username===username)

if(exist){
return res.json({status:"exists"})
}

users.push({
username,
password,
country,
role:"user"
})

res.json({status:"registered"})

})

/* LOGIN */

app.post("/login",(req,res)=>{

let {username,password}=req.body

/* OWNER LOGIN */

if(username===OWNER.username && password===OWNER.password){

return res.json({
status:"owner",
username:OWNER.username
})

}

/* NORMAL USER LOGIN */

let user = users.find(
u => u.username===username && u.password===password
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


/* CHAT USERS */

let onlineUsers = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

onlineUsers[socket.id]={
name:data.name,
role:data.role || "user"
}

io.emit("onlineUsers",Object.values(onlineUsers))

})


socket.on("disconnect",()=>{

delete onlineUsers[socket.id]

io.emit("onlineUsers",Object.values(onlineUsers))

})

})

http.listen(3000,()=>{
console.log("Server running")
})
