const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const multer = require("multer")
const path = require("path")

const User = require("./models/User")

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(express.static("public"))

/* FILE UPLOAD */

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

/* REGISTER */

app.post("/register",async(req,res)=>{

const {username,password,gender} = req.body

const exist = await User.findOne({username})

if(exist){

return res.json({msg:"username already used"})

}

const user = new User({

username,
password,
gender

})

await user.save()

res.json({msg:"registered"})

})

/* LOGIN */

app.post("/login",async(req,res)=>{

const {username,password} = req.body

const user = await User.findOne({username,password})

if(!user){

return res.json({msg:"invalid login"})

}

res.json({

username:user.username,
gender:user.gender,
role:user.role

})

})

/* ADMIN USER LIST */

app.get("/admin/users",async(req,res)=>{

const users = await User.find()

res.json(users)

})

/* SOCKET CHAT */

let onlineUsers = []

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username = data.username
socket.gender = data.gender

onlineUsers.push({

id:socket.id,
username:data.username,
gender:data.gender

})

io.emit("onlineUsers",onlineUsers)

})

socket.on("message",(data)=>{

if(data.msg === "/clear"){

io.emit("clearChat")

return

}

io.emit("message",data)

})

socket.on("disconnect",()=>{

onlineUsers = onlineUsers.filter(u=>u.id !== socket.id)

io.emit("onlineUsers",onlineUsers)

})

})

http.listen(3000,()=>{

console.log("Server running on 3000")

})
