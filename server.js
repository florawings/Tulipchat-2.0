const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const multer=require("multer")
const path=require("path")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.static("public"))

/* upload */

const storage=multer.diskStorage({
destination:"public/uploads",
filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}
})

const upload=multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* users */

let users={}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.username=data.username
socket.room=data.room

socket.join(data.room)

users[socket.id]=data.username

io.to(data.room).emit("system",data.username+" joined the room")

io.emit("online",Object.values(users))

})

socket.on("chat message",(data)=>{

io.to(data.room).emit("chat message",data)

})

socket.on("typing",(name)=>{

socket.broadcast.emit("typing",name+" typing...")

})

socket.on("disconnect",()=>{

let name=users[socket.id]

delete users[socket.id]

if(name){
io.emit("system",name+" left the room")
}

io.emit("online",Object.values(users))

})

})

server.listen(3000,()=>{
console.log("Tulip Chat PRO running")
})
