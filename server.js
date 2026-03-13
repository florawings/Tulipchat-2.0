const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

console.log("User connected")

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

})

const PORT = process.env.PORT || 3000

http.listen(PORT,()=>{
console.log("Server running on",PORT)
})
