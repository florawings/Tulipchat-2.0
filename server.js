const express = require("express")
const fs = require("fs")

const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.json())
app.use(express.static("public"))

let users = {}

if (fs.existsSync("users.json")) {
users = JSON.parse(fs.readFileSync("users.json"))
}

app.post("/register",(req,res)=>{

const {email,password} = req.body

if(users[email]){
return res.json({status:"exists"})
}

users[email] = password
fs.writeFileSync("users.json",JSON.stringify(users))

res.json({status:"ok"})

})

app.post("/login",(req,res)=>{

const {email,password} = req.body

if(users[email] && users[email]===password){
return res.json({status:"ok"})
}

res.json({status:"error"})

})

io.on("connection",(socket)=>{

socket.on("join",(user)=>{
socket.broadcast.emit("msg","SYSTEM : "+user+" joined
