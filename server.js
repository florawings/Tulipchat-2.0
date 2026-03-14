const express=require("express")
const app=express()

const http=require("http").createServer(app)

const io=require("socket.io")(http)

app.use(express.static(__dirname))

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

io.emit("msg",{
name:"System",
text:name+" joined the chat"
})

})

socket.on("msg",(data)=>{

io.emit("msg",data)

})

})

http.listen(3000)
