const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
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

let users = {}

io.on("connection",socket=>{

socket.on("user",name=>{
users[socket.id]=name
io.emit("users",Object.values(users))
})

socket.on("join",room=>{
socket.join(room)
})

socket.on("message",data=>{
io.to(data.room).emit("message",data)
})

socket.on("disconnect",()=>{
delete users[socket.id]
io.emit("users",Object.values(users))
})

})

server.listen(3000,()=>{
console.log("Server running")
})
