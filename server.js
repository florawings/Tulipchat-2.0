const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* upload */

const storage = multer.diskStorage({
destination: "public/uploads",
filename: (req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

let users = {}
let usernames = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username = data.username
socket.room = data.room

socket.join(data.room)

users[socket.id] = data.room
usernames[socket.id] = data.username

io.to(data.room).emit("system",data.username+" joined the room")

io.emit("online",Object.values(usernames))

})

socket.on("message",(data)=>{
io.to(data.room).emit("message",data)
})

socket.on("typing",(data)=>{
socket.to(data.room).emit("typing",data)
})

socket.on("dm",(data)=>{

for(let id in usernames){
if(usernames[id] === data.to){
io.to(id).emit("dm",data)
}
}

})

socket.on("disconnect",()=>{

let name = usernames[socket.id]
let room = users[socket.id]

delete users[socket.id]
delete usernames[socket.id]

if(name && room){
io.to(room).emit("system",name+" left the room")
}

io.emit("online",Object.values(usernames))

})

})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("TulipChat running on "+PORT)
})
