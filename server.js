const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* upload */

const storage = multer.diskStorage({
destination:"uploads",
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.send("/uploads/"+req.file.filename)
})

app.use("/uploads",express.static("uploads"))

/* users */

let users={}
let friends={}

io.on("connection",socket=>{

socket.on("user",name=>{
users[socket.id]=name
io.emit("users",Object.values(users))
})

/* join room */

socket.on("join",room=>{
socket.rooms.forEach(r=>{
if(r!==socket.id){
socket.leave(r)
}
})
socket.join(room)
})

/* message */

socket.on("message",data=>{
io.to(data.room).emit("message",data)
})

/* typing */

socket.on("typing",data=>{
socket.to(data.room).emit("typing",data.user+" typing...")
})

/* dm */

socket.on("dm",data=>{
io.to(data.to).emit("dm",data)
})

/* friend request */

socket.on("friend_request",data=>{
io.emit("friend_request",data)
})

socket.on("disconnect",()=>{
delete users[socket.id]
io.emit("users",Object.values(users))
})

})

server.listen(3000)
