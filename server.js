const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const multer=require("multer")

require("./database")

const authRoutes=require("./routes/auth")
const adminRoutes=require("./routes/admin")
const friendRoutes=require("./routes/friends")
const reportRoutes=require("./routes/report")

const chatSocket=require("./sockets/chatSocket")
const dmSocket=require("./sockets/dmSocket")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

const storage=multer.diskStorage({
destination:"uploads/",
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload=multer({storage})

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename})
})

app.use("/auth",authRoutes)
app.use("/admin",adminRoutes)
app.use("/friends",friendRoutes)
app.use("/report",reportRoutes)

io.on("connection",(socket)=>{
chatSocket(io,socket)
dmSocket(io,socket)
})

server.listen(3000,()=>{
console.log("Tulip Chat running")
})
