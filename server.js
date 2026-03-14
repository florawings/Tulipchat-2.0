const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

const path = require("path")

app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"))
})

let users={}

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

users[socket.id]=name

io.emit("users",users)

io.emit("msg",{
name:"System",
text:name+" joined the chat"
})

})

socket.on("msg",(data)=>{

io.emit("msg",data)

})

socket.on("dm",(data)=>{

io.to(data.to).emit("msg",{
name:data.name,
text:data.text,
private:true
})

})

socket.on("disconnect",()=>{

let name=users[socket.id]

delete users[socket.id]

io.emit("users",users)

io.emit("msg",{
name:"System",
text:name+" left the chat"
})

})

})

const PORT=process.env.PORT || 3000

http.listen(PORT)
