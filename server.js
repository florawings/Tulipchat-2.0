const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

io.on("connection",(socket)=>{

console.log("User connected")

socket.on("chat",(data)=>{
io.emit("msg",data.user + " : " + data.text)
})

socket.on("join",(user)=>{
io.emit("msg","SYSTEM : "+user+" joined")
})

})

const PORT = process.env.PORT || 3000

http.listen(PORT,()=>{
console.log("Server running on " + PORT)
})
