const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const multer = require("multer")
const path = require("path")
const mongoose = require("mongoose")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 3000

/* uploads folder */
if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads")
}

/* static files */
app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

/* MongoDB connect */
mongoose.connect(
"mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat?retryWrites=true&w=majority"
)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err))

/* schema */
const messageSchema = new mongoose.Schema({
name:String,
text:String,
image:String,
system:Boolean,
time:{type:Date,default:Date.now}
})

const Message = mongoose.model("Message",messageSchema)

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

io.on("connection",async(socket)=>{

/* send history */

const history = await Message.find().sort({time:1}).limit(100)

socket.emit("history",history)

/* join */

socket.on("join",async(data)=>{

const joinMsg = data.name+" joined the chat"

io.emit("system",joinMsg)

await Message.create({
text:joinMsg,
system:true
})

})

/* message */

socket.on("message",async(data)=>{

io.emit("message",data)

await Message.create({
name:data.name,
text:data.text
})

})

/* image */

socket.on("image",async(data)=>{

io.emit("image",data)

await Message.create({
name:data.name,
image:data.url
})

})

})

server.listen(PORT,()=>{

console.log("Server running "+PORT)

})
