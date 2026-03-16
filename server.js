const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const mongoose=require("mongoose")
const path=require("path")

const authRoutes=require("./routes/auth")
const friendRoutes=require("./routes/friends")
const reportRoutes=require("./routes/report")
const adminRoutes=require("./routes/admin")

const chatSocket=require("./sockets/chatSocket")
const dmSocket=require("./sockets/dmSocket")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/tulipchat")

// ROUTES
app.use("/",authRoutes)
app.use("/friends",friendRoutes)
app.use("/report",reportRoutes)
app.use("/admin",adminRoutes)

// SOCKETS
io.on("connection",(socket)=>{
console.log("user connected")

chatSocket(io,socket)
dmSocket(io,socket)

socket.on("disconnect",()=>{
console.log("user disconnected")
})

})

const PORT=process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("server running on "+PORT)
})
