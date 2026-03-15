const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const path=require("path")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.static("public"))

let users=[]

io.on("connection",(socket)=>{

console.log("user connected")

socket.on("join",(username)=>{

socket.username=username

users.push(username)

io.emit("user list",users)

})

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

socket.on("disconnect",()=>{

if(socket.username){

users=users.filter(u=>u!==socket.username)

io.emit("user list",users)

}

})

})

server.listen(process.env.PORT||3000,()=>{
console.log("server running")
})
