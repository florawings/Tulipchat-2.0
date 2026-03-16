const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/* OWNER SETTINGS */

const OWNER = "lord_lucifer"
const OWNER_PASS = "766521"
const SUPER_ADMIN = "Garima"

/* DATA */

let onlineUsers = []
let bannedUsers = []
let mutedUsers = []

/* FILE UPLOAD */

const storage = multer.diskStorage({
destination:"uploads/",
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

/* ROUTES */

const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")
const friendRoutes = require("./routes/friends")
const reportRoutes = require("./routes/report")

app.use("/auth",authRoutes)
app.use("/admin",adminRoutes)
app.use("/friends",friendRoutes)
app.use("/report",reportRoutes)

/* SOCKETS */

const chatSocket = require("./sockets/chatSocket")
const dmSocket = require("./sockets/dmSocket")

io.on("connection",(socket)=>{

chatSocket(io,socket)
dmSocket(io,socket)

/* JOIN */

socket.on("join",(user)=>{

if(bannedUsers.includes(user.username)){
socket.emit("banned")
return
}

onlineUsers.push({
id:socket.id,
username:user.username,
ip:socket.handshake.address
})

io.emit("onlineUsers",onlineUsers)

socket.broadcast.emit("system",user.username+" joined")

})

/* COMMANDS */

socket.on("ban",(username)=>{
bannedUsers.push(username)
io.emit("system",username+" banned")
})

socket.on("mute",(username)=>{
mutedUsers.push(username)
})

socket.on("kick",(username)=>{

const user = onlineUsers.find(u=>u.username===username)

if(user){
io.to(user.id).emit("kick")
}

})

socket.on("clearChat",()=>{
io.emit("clearChat")
})

socket.on("disconnect",()=>{

onlineUsers = onlineUsers.filter(u=>u.id !== socket.id)

io.emit("onlineUsers",onlineUsers)

})

})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("Tulip Chat running on "+PORT)
})
