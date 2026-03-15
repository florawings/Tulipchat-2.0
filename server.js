const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const multer = require("multer")

app.use(express.static("public"))

/* FILE UPLOAD */

const storage = multer.diskStorage({
destination: (req,file,cb)=>{
cb(null,"public/uploads")
},
filename: (req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* USERS + CHAT HISTORY */

let users = {}
