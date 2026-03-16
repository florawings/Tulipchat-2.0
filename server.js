const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))

/* USERS MEMORY */

let users = [
 { username:"Lord_lucifer", password:"766521", role:"owner" }
]

/* REGISTER */

app.post("/register",(req,res)=>{

 const {username,password} = req.body

 if(!username || !password){
  return res.json({error:"Missing fields"})
 }

 const exist = users.find(u=>u.username===username)

 if(exist){
  return res.json({error:"User exists"})
 }

 users.push({
  username,
  password,
  role:"user"
 })

 res.json({success:true})

})

/* LOGIN */

app.post("/login",(req,res)=>{

 const {username,password}=req.body

 const user = users.find(
  u=>u.username===username && u.password===password
 )

 if(!user){
  return res.json({error:"Invalid login"})
 }

 res.json({
  success:true,
  username:user.username,
  role:user.role
 })

})

/* SOCKET CHAT */

let onlineUsers=[]
let dmUsers={}

io.on("connection",(socket)=>{

 socket.on("join",(username)=>{

  socket.username=username
  dmUsers[username]=socket.id

  if(!onlineUsers.includes(username)){
   onlineUsers.push(username)
  }

  io.emit("onlineUsers",onlineUsers)

 })

 socket.on("chat",(data)=>{
  io.emit("chat",data)
 })

 socket.on("dm",(data)=>{

  const target=dmUsers[data.to]

  if(target){
   io.to(target).emit("dm",data)
  }

 })

 socket.on("disconnect",()=>{

  onlineUsers=onlineUsers.filter(
   u=>u!==socket.username
  )

  delete dmUsers[socket.username]

  io.emit("onlineUsers",onlineUsers)

 })

})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
 console.log("Server running on "+PORT)
})
