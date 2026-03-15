const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use("/uploads",express.static("public/uploads"))

/* FILE STORAGE */

const storage = multer.diskStorage({

destination:function(req,file,cb){
cb(null,"public/uploads")
},

filename:function(req,file,cb){
cb(null,Date.now()+"_"+file.originalname)
}

})

const upload = multer({storage})

/* UPLOAD API */

app.post("/upload",upload.single("file"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

/* SOCKET */

let users = []

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

/* MESSAGE */

socket.on("message",(data)=>{

io.emit("message",data)

})

socket.on("disconnect",()=>{

users = users.filter(u=>u.id!==socket.id)

io.emit("onlineUsers",users)

})

})

server.listen(3000,()=>{
console.log("Server running")
})
