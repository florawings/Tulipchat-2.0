const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.json())
app.use(express.static("public"))

let users=[]
let onlineUsers={}
let rooms=["general"]

const OWNER_NAME="owner"


// REGISTER

app.post("/register",(req,res)=>{

let {username,password,country}=req.body

let exist=users.find(u=>u.username===username)

if(exist){
return res.json({status:"user_exists"})
}

users.push({
username,
password,
country,
role:"user"
})

res.json({status:"registered"})

})


// LOGIN

app.post("/login",(req,res)=>{

let {username,password}=req.body

let user=users.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({status:"invalid"})
}

res.json({
status:"success",
role:user.role
})

})



// SOCKET

io.on("connection",(socket)=>{


socket.on("join",(data)=>{

let role="guest"

if(data.type==="registered"){

let user=users.find(u=>u.username===data.name)

if(user){
role=user.role
}

}

if(data.name===OWNER_NAME){
role="owner"
}

onlineUsers[socket.id]={
name:data.name,
role
}

socket.join("general")

io.emit("system",data.name+" joined chat")

})




// MESSAGE

socket.on("message",(data)=>{

let user=onlineUsers[socket.id]

if(!user) return

io.to(data.room).emit("message",{
user:user.name,
role:user.role,
text:data.text
})

})




// CREATE ROOM

socket.on("createRoom",(room)=>{

let user=onlineUsers[socket.id]

if(user.role!=="owner") return

if(!rooms.includes(room)){

rooms.push(room)

io.emit("rooms",rooms)

}

})




// KICK USER

socket.on("kick",(target)=>{

let user=onlineUsers[socket.id]

if(user.role!=="owner" && user.role!=="superadmin") return

for(let id in onlineUsers){

if(onlineUsers[id].name===target){

io.to(id).emit("system","You were kicked")

io.sockets.sockets.get(id).disconnect()

}

}

})




// PROMOTE USER

socket.on("promote",(target)=>{

let user=onlineUsers[socket.id]

if(user.role!=="owner") return

let u=users.find(x=>x.username===target)

if(u){
u.role="superadmin"
}

})


})



http.listen(3000,()=>{
console.log("Server running")
})
