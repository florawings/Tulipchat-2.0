const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const multer = require("multer")
const path = require("path")

app.use(express.json())
app.use(express.static("public"))

let onlineUsers=[]
let friends={}
let reports=[]

const OWNER="Lord_lucifer"
const SUPERADMIN="Garima"

const storage = multer.diskStorage({
destination:"public/uploads",
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username=data.username

socket.role="user"

if(data.username===OWNER) socket.role="owner"
if(data.username===SUPERADMIN) socket.role="superadmin"

onlineUsers.push({
id:socket.id,
username:data.username,
role:socket.role
})

io.emit("onlineUsers",onlineUsers)

})

socket.on("message",(data)=>{

io.emit("message",data)

})

/* DM */

socket.on("dm",(data)=>{

onlineUsers.forEach(u=>{
if(u.username===data.to){
io.to(u.id).emit("dm",data)
}
})

})

/* FRIEND REQUEST */

socket.on("friendRequest",(data)=>{

if(!friends[data.to]) friends[data.to]=[]

friends[data.to].push(data.from)

onlineUsers.forEach(u=>{
if(u.username===data.to){
io.to(u.id).emit("friendRequest",data)
}
})

})

/* REPORT USER */

socket.on("reportUser",(data)=>{

reports.push(data)

})

/* BAN */

socket.on("banUser",(target)=>{

if(socket.role!=="owner" && socket.role!=="superadmin") return

onlineUsers.forEach(u=>{
if(u.username===target){
io.to(u.id).disconnectSockets()
}
})

})

socket.on("disconnect",()=>{

onlineUsers=onlineUsers.filter(u=>u.id!==socket.id)

io.emit("onlineUsers",onlineUsers)

})

})

http.listen(3000,()=>{

console.log("Tulip Chat running")

})
