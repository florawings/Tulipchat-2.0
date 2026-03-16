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

/* ---------- FILE UPLOAD ---------- */

const storage = multer.diskStorage({
 destination: "uploads/",
 filename: (req, file, cb) => {
  cb(null, Date.now() + path.extname(file.originalname))
 }
})

const upload = multer({ storage })

app.post("/upload", upload.single("image"), (req, res) => {

 res.json({
  url: "/uploads/" + req.file.filename
 })

})

/* ---------- MEMORY USERS ---------- */

let users = [
 { username: "Lord_lucifer", password: "766521", role: "owner", email:"owner@tulip" }
]

let bannedUsers = []

/* ---------- REGISTER ---------- */

app.post("/register", (req, res) => {

 const { username, password, email, age, gender } = req.body

 if (!username || !password) {
  return res.json({ error: "Missing fields" })
 }

 const exist = users.find(u => u.username === username)

 if (exist) {
  return res.json({ error: "User exists" })
 }

 users.push({
  username,
  password,
  email,
  age,
  gender,
  role:"user"
 })

 res.json({ success:true })

})

/* ---------- LOGIN ---------- */

app.post("/login", (req, res) => {

 const { username, password } = req.body

 if(bannedUsers.includes(username)){
  return res.json({error:"User banned"})
 }

 const user = users.find(
  u => u.username === username && u.password === password
 )

 if(!user){
  return res.json({error:"Invalid login"})
 }

 res.json({success:true, role:user.role})

})

/* ---------- ADMIN APIs ---------- */

app.get("/admin/users",(req,res)=>{
 res.json(users)
})

app.post("/admin/ban/:name",(req,res)=>{

 const name=req.params.name

 bannedUsers.push(name)

 res.json({success:true})

})

app.post("/admin/kick/:name",(req,res)=>{

 const name=req.params.name

 const socketId = Object.keys(io.sockets.sockets).find(id=>{
  return io.sockets.sockets.get(id).username === name
 })

 if(socketId){
  io.sockets.sockets.get(socketId).disconnect()
 }

 res.json({success:true})

})

app.post("/admin/clear",(req,res)=>{

 io.emit("clearChat")

 res.json({success:true})

})

/* ---------- SOCKET ---------- */

let onlineUsers=[]
let sockets={}

io.on("connection",(socket)=>{

 socket.on("join",(username)=>{

  socket.username=username
  sockets[username]=socket

  if(!onlineUsers.includes(username)){
   onlineUsers.push(username)
  }

  io.emit("onlineUsers",onlineUsers)

 })

 /* CHAT */

 socket.on("chat",(msg)=>{

  io.emit("chat",msg)

 })

 /* DM */

 socket.on("dm",(data)=>{

  const target=sockets[data.to]

  if(target){
   target.emit("dm",data)
  }

 })

 /* DISCONNECT */

 socket.on("disconnect",()=>{

  onlineUsers=onlineUsers.filter(
   u=>u!==socket.username
  )

  delete sockets[socket.username]

  io.emit("onlineUsers",onlineUsers)

 })

})

/* ---------- START SERVER ---------- */

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{

 console.log("Server running on port "+PORT)

})
