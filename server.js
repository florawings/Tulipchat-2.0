const express=require("express")
const http=require("http")
const {Server}=require("socket.io")

const authRoutes=require("./routes/auth")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))

app.use("/api/auth",authRoutes)

io.on("connection",(socket)=>{
console.log("user connected")
})

server.listen(3000,()=>{
console.log("Tulip Chat running")
})
