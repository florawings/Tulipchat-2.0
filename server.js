const express = require("express")
const app = express()

const http = require("http").createServer(app)
const { Server } = require("socket.io")

const multer = require("multer")
const path = require("path")

const io = new Server(http)

app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,"uploads")
},

filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}

})

const upload = multer({storage:storage})

let users = {}

app.post("/upload",upload.single("file"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

io.on("connection",(socket)=>{

socket.on
