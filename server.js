const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const path=require("path")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public/login.html"))
})

let users=[]
let messages=[]
let onlineUsers=[]

app.post("/register",(req,res)=>{

const {username,password}=req.body

const exist=users.find(u=>u.username===username)

if(exist){
return res.json({error:"user exists"})
}

users.push({username,password})

res.json({success:true})

})

app.post("/login",(req,res)=>{

const {username,password}=req.body

const user=users.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({error:"invalid"})
}

res.json({success:true})

})

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

socket.username=username

if(!onlineUsers.includes(username)){
onlineUsers.push(username)
}

io.emit("onlineUsers",onlineUsers)

socket.emit("chatHistory",messages)

})

socket.on("chat",(msg)=>{

if(msg.text==="/clear"){
messages=[]
io.emit("clearChat")
return
}

messages.push(msg)

io.emit("chat",msg)

})

socket.on("disconnect",()=>{

onlineUsers=onlineUsers.filter(
u=>u!==socket.username
)

io.emit("onlineUsers",onlineUsers)

})

})

const PORT=process.env.PORT||3000

server.listen(PORT,()=>{
console.log("Server running")
})
