const express = require("express")
const http = require("http")
const {Server} = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))

let users = []

app.post("/register",(req,res)=>{

const {username,email,password,dob,gender,country} = req.body

if(!username || !email || !password){
return res.json({ok:false})
}

users.push({
username,email,password,dob,gender,country
})

res.json({ok:true})

})

app.post("/login",(req,res)=>{

const {username,password} = req.body

let user = users.find(u=>u.username===username && u.password===password)

if(user){
res.json({ok:true})
}else{
res.json({ok:false})
}

})

io.on("connection",(socket)=>{

socket.on("join",(user)=>{

socket.user=user
io.emit("msg","SYSTEM : "+user+" joined")

})

socket.on("chat",(data)=>{

io.emit("msg",data.user+" : "+data.text)

})

})

server.listen(3000)
