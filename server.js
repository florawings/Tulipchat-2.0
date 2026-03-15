const express=require("express")
const app=express()
const http=require("http").createServer(app)
const io=require("socket.io")(http)

const multer=require("multer")

app.use(express.static("public"))

const storage=multer.diskStorage({
destination:(req,file,cb)=>{cb(null,"public/uploads")},
filename:(req,file,cb)=>{cb(null,Date.now()+"-"+file.originalname)}
})

const upload=multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

let users={}
let messages=[]

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[socket.id]={name:data.name,gender:data.gender}

io.emit("online",users)

messages.forEach(m=>socket.emit("message",m))

})

socket.on("message",(m)=>{

if(m.msg && m.msg.trim().toLowerCase()==="/clear"){
messages=[]
io.emit("clearChat")
return
}

messages.push(m)

if(messages.length>300){messages.shift()}

io.emit("message",m)

})

socket.on("disconnect",()=>{

delete users[socket.id]

io.emit("online",users)

})

})

http.listen(3000)
