const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname,"public")))

let onlineUsers=[]
let dmUsers={}

io.on("connection",(socket)=>{

 console.log("User connected")

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

 socket.on("clear",()=>{

  if(socket.username==="Lord_lucifer"){
   io.emit("clearChat")
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
