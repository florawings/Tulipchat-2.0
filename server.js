const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* upload */

const storage = multer.diskStorage({
destination:"public/uploads",
filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* memory db */

let users={}
let friends={}
let privateRoomUsers=["owner"]

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username=data.username
socket.room=data.room

if(data.room==="private" && !privateRoomUsers.includes(data.username)){
socket.emit("denied","Private room access denied")
return
}

socket.join(data.room)

users[socket.id]=data.username

io.to(data.room).emit("system",data.username+" joined room")

io.emit("online",Object.values(users))

})

socket.on("chat message",(data)=>{

io.to(data.room).emit("chat message",data)

})

/* DM */

socket.on("dm",(data)=>{

for(let id in users){

if(users[id]===data.to){

io.to(id).emit("dm",data)

}

}

})

/* friend request */

socket.on("friend request",(data)=>{

if(!friends[data.to]) friends[data.to]=[]

friends[data.to].push(data.from)

for(let id in users){

if(users[id]===data.to){

io.to(id).emit("friend request",data.from)

}

}

})

socket.on("typing",(user)=>{

socket.broadcast.emit("typing",user)

})

socket.on("disconnect",()=>{

if(users[socket.id]){
io.emit("system",users[socket.id]+" left")
}

delete users[socket.id]

io.emit("online",Object.values(users))

})

})

server.listen(3000,()=>{

console.log("Tulip Chat 5.0 running")

})
