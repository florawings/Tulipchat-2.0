const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

/* upload */

const storage = multer.diskStorage({
destination:(req,file,cb)=>cb(null,"uploads/"),
filename:(req,file,cb)=>cb(null,Date.now()+"_"+file.originalname)
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* users */

const users={}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{
users[socket.id]=data.name
io.emit("online",users)
})

socket.on("message",(data)=>{
io.emit("message",data)
})

socket.on("dm",(data)=>{
io.to(data.to).emit("dm",data)
})

socket.on("disconnect",()=>{
delete users[socket.id]
io.emit("online",users)
})

})

server.listen(3000,()=>{
console.log("Tulip Chat running")
})
