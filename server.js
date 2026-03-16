const express=require("express")
const http=require("http")
const {Server}=require("socket.io")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))

/* USERS */

let users=[
 {username:"Lord_lucifer",password:"766521",role:"owner"}
]

/* CHAT STATE */

let onlineUsers=[]
let messages=[]
let sockets={}

/* LOGIN */

app.post("/login",(req,res)=>{

 const {username,password}=req.body

 const user=users.find(
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

/* SOCKET */

io.on("connection",(socket)=>{

 socket.on("join",(username)=>{

  socket.username=username
  sockets[username]=socket.id

  if(!onlineUsers.includes(username)){
   onlineUsers.push(username)
  }

  io.emit("onlineUsers",onlineUsers)

  socket.emit("chatHistory",messages)

 })

 /* CHAT */

 socket.on("chat",(msg)=>{

  if(msg.text==="/clear"){

   messages=[]
   io.emit("clearChat")
   return

  }

  messages.push(msg)

  io.emit("chat",msg)

 })

 /* DM */

 socket.on("dm",(data)=>{

  const id=sockets[data.to]

  if(id){
   io.to(id).emit("dm",data)
  }

 })

 socket.on("disconnect",()=>{

  onlineUsers=onlineUsers.filter(
   u=>u!==socket.username
  )

  delete sockets[socket.username]

  io.emit("onlineUsers",onlineUsers)

 })

})

server.listen(process.env.PORT||3000,()=>{

 console.log("Server running")

})
