const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const multer = require("multer")
const path = require("path")
const {MongoClient} = require("mongodb")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 3000

const mongo = new MongoClient("mongodb+srv://epfportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mrighsb.mongodb.net/?retryWrites=true&w=majority")

let db
let users = {}

mongo.connect().then(()=>{
db = mongo.db("tulipchat")
console.log("MongoDB connected")
})

if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads")
}

app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname))
}
})

const upload = multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

/* load old messages */

app.get("/messages",async(req,res)=>{
const msgs = await db.collection("messages").find().sort({_id:1}).toArray()
res.json(msgs)
})

/* socket */

io.on("connection",(socket)=>{

socket.on("join",(name)=>{
users[socket.id]=name
io.emit("users",Object.values(users))
})

socket.on("message",async(data)=>{

await db.collection("messages").insertOne(data)

io.emit("message",data)

})

socket.on("image",async(data)=>{

await db.collection("messages").insertOne(data)

io.emit("image",data)

})

socket.on("dm",(data)=>{
io.to(data.to).emit("dm",data)
})

socket.on("disconnect",()=>{
delete users[socket.id]
io.emit("users",Object.values(users))
})

})

server.listen(PORT,()=>{
console.log("server running")
})
