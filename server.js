const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const multer=require("multer")
const sharp=require("sharp")
const fs=require("fs")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

let onlineUsers={}

/* socket chat */

io.on("connection",(socket)=>{

socket.on("join",(username)=>{
socket.username=username
onlineUsers[username]=socket.id
io.emit("user list",Object.keys(onlineUsers))
})

socket.on("chat message",(data)=>{
io.emit("chat message",data)
})

socket.on("private message",(data)=>{

let target=onlineUsers[data.to]

if(target){

io.to(target).emit("private message",{
from:data.from,
to:data.to,
msg:data.msg
})

}

})

socket.on("disconnect",()=>{
delete onlineUsers[socket.username]
io.emit("user list",Object.keys(onlineUsers))
})

})

/* upload setup */

const storage=multer.diskStorage({
destination:function(req,file,cb){
cb(null,"uploads")
},
filename:function(req,file,cb){
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload=multer({storage})

/* upload route */

app.post("/upload",upload.single("image"),async(req,res)=>{

let inputPath=req.file.path
let outputPath="uploads/compressed-"+req.file.filename

await sharp(inputPath)
.resize({width:900})
.jpeg({quality:70})
.toFile(outputPath)

fs.unlinkSync(inputPath)

res.json({
url:"/"+outputPath
})

})

server.listen(process.env.PORT||3000,()=>{
console.log("Server running")
})
