const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* file upload */

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

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

users[socket.id]=username

io.emit("online",Object.values(users))

io.emit("system",username+" joined the room")

})

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

socket.on("typing",(name)=>{

socket.broadcast.emit("typing",name+" is typing...")

})

socket.on("disconnect",()=>{

let name=users[socket.id]

delete users[socket.id]

io.emit("online",Object.values(users))

if(name){
io.emit("system",name+" left the room")
}

})

})

server.listen(3000,()=>{
console.log("Tulip Chat running on 3000")
})
