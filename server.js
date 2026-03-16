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

/* ---------------- USERS MEMORY ---------------- */

let users = []

/* OWNER AUTO CREATE */

users.push({
 username:"Lord_lucifer",
 password:"766521",
 role:"owner"
})

/* ---------------- REGISTER ---------------- */

app.post("/register",(req,res)=>{

 const {username,password,email,age,gender} = req.body

 if(!username || !password){
  return res.json({error:"Missing fields"})
 }

 let exist = users.find(u=>u.username===username)

 if(exist){
  return res.json({error:"User already exists"})
 }

 users.push({
  username,
  password,
  email,
  age,
  gender,
  role:"user"
 })

 res.json({success:true})

})

/* ---------------- LOGIN ---------------- */

app.post("/login",(req,res)=>{

 const {username,password} = req.body

 let user = users.find(
  u=>u.username===username && u.password===password
 )

 if(!user){
  return res.json({error:"Invalid login"})
 }

 res.json({
  success:true,
  role:user.role
 })

})

/* ---------------- FILE UPLOAD ---------------- */

const storage = multer.diskStorage({
 destination:"uploads",
 filename:(req,file,cb)=>{
  cb(null,Date.now()+"_"+file.originalname)
 }
})

const upload = multer({storage})

app.post("/upload",upload.single("photo"),(req,res)=>{

 if(!req.file){
  return res.json({error:"no file"})
 }

 res.json({
  url:"/uploads/"+req.file.filename
 })

})

/* ---------------- SOCKET CHAT ---------------- */

let onlineUsers=[]

io.on("connection",(socket)=>{

 console.log("user connected")

 socket.on("join",(username)=>{

  socket.username=username

  if(!onlineUsers.includes(username)){
   onlineUsers.push(username)
  }

  io.emit("onlineUsers",onlineUsers)

 })

 socket.on("chat",(msg)=>{

  io.emit("chat",msg)

 })

 socket.on("disconnect",()=>{

  onlineUsers=onlineUsers.filter(
   u=>u!==socket.username
  )

  io.emit("onlineUsers",onlineUsers)

 })

})

/* ---------------- START SERVER ----------------
