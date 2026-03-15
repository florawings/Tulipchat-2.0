const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/* FILE UPLOAD */

const storage = multer.diskStorage({
destination:(req,file,cb)=>cb(null,"uploads/"),
filename:(req,file,cb)=>cb(null,Date.now()+"_"+file.originalname)
})

const upload = multer({storage})

app.post("/upload", upload.single("file"), (req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* USERS */

const users={}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[socket.id]={
name:data.user,
gender:data.gender
}

io.emit("onlineUsers",users)

})

socket.on("publicMessage",(data)=>{
io.emit("publicMessage",data)
})

/* DM */

socket.on("startDM",(data)=>{
const room=[socket.id,data.to].sort().join("-")
socket.join(room)
io.to(data.to).emit("openDM",{room,from:data.from,id:socket.id})
socket.emit("openDM",{room,from:data.from,id:data.to})
})

socket.on("dmMessage",(data)=>{
io.to(data.room).emit("dmMessage",data)
})

socket.on("disconnect",()=>{
delete users[socket.id]
io.emit("onlineUsers",users)
})

})

server.listen(3000,()=>console.log("Tulip Chat running"))
