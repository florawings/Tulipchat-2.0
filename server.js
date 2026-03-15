const express=require("express")
const http=require("http")
const {Server}=require("socket.io")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.static("public"))

let onlineUsers={}

io.on("connection",(socket)=>{

console.log("user connected")

socket.on("join",(username)=>{

socket.username=username
onlineUsers[username]=socket.id

io.emit("user list",Object.keys(onlineUsers))

})

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

socket.on("private message",(data)=>{

let target=onlineUsers[data.to]

if(target){

io.to(target).emit("private message",{
from:data.from,
msg:data.msg
})

}

})

socket.on("disconnect",()=>{

delete onlineUsers[socket.username]

io.emit("user list",Object.keys(onlineUsers))

})

})

server.listen(process.env.PORT||3000,()=>{
console.log("server running")
})
