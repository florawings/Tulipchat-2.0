const express = require("express")
const app = express()

const http = require("http").createServer(app)

const { Server } = require("socket.io")
const io = new Server(http)

const multer = require("multer")
const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")

// ----------------------------
// MongoDB Connection
// ----------------------------

mongoose.connect(
"mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat?retryWrites=true&w=majority"
)

mongoose.connection.on("connected",()=>{
console.log("MongoDB connected")
})

mongoose.connection.on("error",(err)=>{
console.log("MongoDB error",err)
})

// ----------------------------
// Message Schema
// ----------------------------

const Message = mongoose.model("Message",{

name:String,
text:String,
image:String,
system:Boolean,
time:{type:Date,default:Date.now}

})

// ----------------------------
// Upload folder
// ----------------------------

if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads")
}

app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

// ----------------------------
// Multer config
// ----------------------------

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,"uploads")
},

filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}

})

const upload = multer({storage})

// ----------------------------
// Upload API
// ----------------------------

app.post("/upload",upload.single("file"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

// ----------------------------
// Users
// ----------------------------

let users = {}

// ----------------------------
// Socket connection
// ----------------------------

io.on("connection",(socket)=>{

// USER JOIN

socket.on("join",async(data)=>{

users[socket.id]=data

io.emit("users",users)

let joinMsg=data.name+" joined the chat"

let msg=new Message({
system:true,
text:joinMsg
})

await msg.save()

io.emit("system",joinMsg)

// SEND CHAT HISTORY

let history=await Message.find().sort({_id:1}).limit(100)

socket.emit("history",history)

})

// TEXT MESSAGE

socket.on("message",async(data)=>{

let msg=new Message({
name:data.name,
text:data.text
})

await msg.save()

io.emit("message",data)

})

// IMAGE / GIF

socket.on("image",async(data)=>{

let msg=new Message({
name:data.name,
image:data.url
})

await msg.save()

io.emit("image",data)

})

// USER DISCONNECT

socket.on("disconnect",()=>{

let user=users[socket.id]

if(user){

let leaveMsg=user.name+" left the chat"

io.emit("system",leaveMsg)

}

delete users[socket.id]

io.emit("users",users)

})

})

// ----------------------------
// Server Start
// ----------------------------

const PORT=process.env.PORT || 10000

http.listen(PORT,()=>{

console.log("Tulip Chat running on port "+PORT)

})
