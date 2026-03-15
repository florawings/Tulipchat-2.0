const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/* FILE UPLOAD */

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads/")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"_"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{

const url="/uploads/"+req.file.filename

res.json({
url:url
})

})

/* SOCKET CHAT */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.join(data.room)

io.to(data.room).emit("message",{
user:"System",
msg:data.user+" joined the room"
})

})

socket.on("message",(data)=>{

io.to(data.room).emit("message",data)

})

})

server.listen(3000,()=>{
console.log("Server running")
})
