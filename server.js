const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 3000

/* uploads folder */

if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads")
}

app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/* file upload */

const storage = multer.diskStorage({

destination:function(req,file,cb){
cb(null,"uploads/")
},

filename:function(req,file,cb){
cb(null,Date.now()+path.extname(file.originalname))
}

})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

/* socket */

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

const joinMsg = data.name + " joined the chat"

io.emit("system",joinMsg)

})

socket.on("message",(data)=>{

io.emit("message",data)

})

socket.on("image",(data)=>{

io.emit("image",data)

})

})

server.listen(PORT,()=>{

console.log("Server running "+PORT)

})
