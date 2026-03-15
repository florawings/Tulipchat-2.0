const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const User = require("./models/User")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

/* DEFAULT OWNER + SUPER ADMIN */

const OWNER_NAME = "Lord_lucifer"
const DEFAULT_SUPER_ADMIN = "Garima"

/* REGISTER */

app.post("/register",async(req,res)=>{

const {username,password,gender} = req.body

let role = "user"

if(username === OWNER_NAME){
role = "owner"
}

if(username === DEFAULT_SUPER_ADMIN){
role = "superadmin"
}

const exist = await User.findOne({username})

if(exist){
return res.json({msg:"Username already used"})
}

const user = new User({
username,
password,
gender,
role
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

/* PROMOTE USER */

app.post("/admin/promote",async(req,res)=>{

const {owner,target} = req.body

const ownerUser = await User.findOne({username:owner})

if(ownerUser.role !== "owner"){
return res.json({msg:"only owner can promote"})
}

await User.updateOne(
{username:target},
{$set:{role:"superadmin"}}
)

res.json({msg:"user promoted"})

})

/* DEMOTE USER */

app.post("/admin/demote",async(req,res)=>{

const {owner,target} = req.body

const ownerUser = await User.findOne({username:owner})

if(ownerUser.role !== "owner"){
return res.json({msg:"only owner can demote"})
}

await User.updateOne(
{username:target},
{$set:{role:"user"}}
)

res.json({msg:"user demoted"})

})

/* SOCKET CHAT */

let onlineUsers = []

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username = data.username
socket.gender = data.gender
socket.role = data.role

onlineUsers.push({
id:socket.id,
username:data.username,
gender:data.gender,
role:data.role
})

io.emit("onlineUsers",onlineUsers)

})

socket.on("message",(data)=>{

if(data.msg === "/clear"){

if(data.role === "owner" || data.role === "superadmin"){
io.emit("clearChat")
}

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

console.log("Server running")

})
