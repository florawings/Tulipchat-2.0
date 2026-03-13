const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))
app.use(express.json())

let users=[]
let accounts=[]


app.post("/register",(req,res)=>{

let {username,password,email,dob,gender,country}=req.body

let birth=new Date(dob)
let today=new Date()

let age=today.getFullYear()-birth.getFullYear()
let m=today.getMonth()-birth.getMonth()

if(m<0 || (m===0 && today.getDate()<birth.getDate())) age--

if(age<18){
return res.json({ok:false,msg:"Only 18+ allowed"})
}

if(accounts.find(u=>u.username===username)){
return res.json({ok:false,msg:"Username already exists"})
}

accounts.push({username,password,email,dob,gender,country})

res.json({ok:true})

})


app.post("/login",(req,res)=>{

let {username,password}=req.body

let user=accounts.find(u=>u.username===username && u.password===password)

if(!user){
return res.json({ok:false})
}

res.json({ok:true})

})


io.on("connection",(socket)=>{

socket.on("join",(user)=>{

socket.username=user
users.push(user)

io.emit("system","SYSTEM : "+user+" joined")
io.emit("users",users)

})


socket.on("chat",(data)=>{

io.emit("msg",data.user+" : "+data.text)

})


socket.on("disconnect",()=>{

users=users.filter(u=>u!==socket.username)

io.emit("users",users)

})

})


http.listen(3000,()=>{

console.log("Server running")

})
