const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const mongoose=require("mongoose")
const multer=require("multer")

const authRoutes=require("./routes/auth")
const adminRoutes=require("./routes/admin")

const chatSocket=require("./sockets/chatSocket")
const dmSocket=require("./sockets/dmSocket")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads",express.static("uploads"))

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/tulipchat")

// ROUTES
app.use("/",authRoutes)
app.use("/admin",adminRoutes)

// PROFILE PHOTO UPLOAD
const storage=multer.diskStorage({

destination:"uploads",

filename:(req,file,cb)=>{
cb(null,Date.now()+"_"+file.originalname)
}

})

const upload=multer({storage})

app.post("/upload",upload.single("photo"),(req,res)=>{

res.json({
url:"/uploads/"+req.file.filename
})

})

// SOCKETS
io.on("connection",(socket)=>{

chatSocket(io,socket)
dmSocket(io,socket)

})

const PORT=process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("Tulip Chat running on "+PORT)
})
