const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

const multer = require("multer")

app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

const storage = multer.diskStorage({
destination:"uploads/",
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("image"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

let users={}
let registered={}

io.on("connection",(socket)=>{

socket.on("register",(data)=>{

if(registered[data.email]){

socket.emit("registerError","User exists")
return
}

registered[data.email]=data.password

socket.emit("registerSuccess")

})

socket.on("login",(data)=>{

if(!registered[data.email]){

socket.emit("loginError","User not registered")
return
}

if(registered[data.email]!==data.password){

socket.emit("loginError","Wrong password")
return
}

users[data.email]=socket.id

socket.emit("loginSuccess")

})

socket.on("join",(data)=>{

socket.join(data.room)

io.to(data.room).emit("chat message",{
user:"SYSTEM",
msg:data.user+" joined room"
})

})

socket.on("chat message",(data)=>{

io.to(data.room).emit("chat message",data)

})

socket.on("private message",(data)=>{

let target=users[data.to]

if(target){

io.to(target).emit("private message",data)

}

})

})

http.listen(3000)
