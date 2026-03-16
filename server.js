const express=require("express")
const http=require("http")
const {Server}=require("socket.io")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.static("public"))

let onlineUsers=[]
let sockets={}
let messages=[]

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

socket.on("chat",(msg)=>{

if(msg.text==="/clear"){
messages=[]
io.emit("clearChat")
return
}

messages.push(msg)

io.emit("chat",msg)

})

socket.on("dm",(data)=>{

const target=sockets[data.to]

if(target){
io.to(target).emit("dm",data)
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

server.listen(process.env.PORT||3000)
