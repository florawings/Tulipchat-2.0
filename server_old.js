const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const bcrypt=require("bcryptjs")
const multer=require("multer")

const User=require("./models/User")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))

const OWNER="Lord_lucifer"
const OWNER_PASS="766521"
const SUPER_ADMIN="Garima"

let onlineUsers=[]
let banned=[]
let muted=[]

/* FILE UPLOAD */

const storage=multer.diskStorage({
destination:"public/uploads",
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload=multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* REGISTER */

app.post("/register",async(req,res)=>{

const {username,age,gender,email,password}=req.body

const exist=await User.findOne({username})

if(exist){
return res.json({error:"username exists"})
}

const hash=await bcrypt.hash(password,10)

await User.create({
username,
age,
gender,
email,
password:hash
})

res.json({msg:"registered"})
})

/* LOGIN */

app.post("/login",async(req,res)=>{

const {username,password}=req.body

let role="user"

if(username===OWNER && password===OWNER_PASS){
role="owner"
}

if(username===SUPER_ADMIN){
role="superadmin"
}

const user=await User.findOne({username})

if(!user && role!=="owner" && role!=="superadmin"){
return res.json({error:"user not found"})
}

if(user){
const ok=await bcrypt.compare(password,user.password)
if(!ok){
return res.json({error:"wrong password"})
}
}

res.json({
username,
role,
gender:user?.gender
})

})

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username=data.username
socket.role=data.role

onlineUsers.push({
id:socket.id,
username:data.username,
role:data.role
})

io.emit("users",onlineUsers)

io.emit("msg",{
system:true,
text:data.username+" joined chat"
})

})

socket.on("msg",(m)=>{

if(muted.includes(socket.username)) return

if(m==="/clear" && socket.role==="owner"){
io.emit("clear")
return
}

io.emit("msg",{
username:socket.username,
role:socket.role,
text:m
})

})

socket.on("ban",(u)=>{
if(socket.role==="owner"){
banned.push(u)
}
})

socket.on("disconnect",()=>{

onlineUsers=onlineUsers.filter(u=>u.id!==socket.id)

io.emit("users",onlineUsers)

})

})

server.listen(3000)
