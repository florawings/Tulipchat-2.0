const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const cors = require("cors")

require("./database")

const authRoutes = require("./routes/auth")

const app = express()
const server = http.createServer(app)

const io = new Server(server)

app.use(cors())
app.use(express.json())

app.use("/api",authRoutes)

app.use(express.static("public"))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

users[socket.id]=username

io.emit("onlineUsers",Object.values(users))

})

socket.on("chat message",(data)=>{

io.emit("chat message",data)

})

socket.on("disconnect",()=>{

delete users[socket.id]

io.emit("onlineUsers",Object.values(users))

})

})

server.listen(process.env.PORT || 3000)
