const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const multer = require("multer")
const path = require("path")

let users = []

/* FILE UPLOAD */

const storage = multer.diskStorage({
destination: "public/uploads",
filename: (req,file,cb)=>{
cb(null, Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.use(express.static("public"))

app.post("/upload", upload.single("file"), (req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username = data.username
socket.gender = data.gender

users.push({
id:socket.id,
username:data.username,
gender:data.gender
})

io.emit("onlineUsers",users)

})

socket.on("message",(data)=>{

/* CLEAR COMMAND */

if(data.msg === "/clear"){
io.emit("clearChat")
return
}

io.emit("message",data)

})

socket.on("disconnect",()=>{

users = users.filter(u=>u.id !== socket.id)

io.emit("onlineUsers",users)

})

})

http.listen(3000,()=>{
console.log("Server running")
})
