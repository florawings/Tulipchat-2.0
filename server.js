const express=require("express")
const http=require("http")
const {Server}=require("socket.io")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(express.static("public"))

let users=[
{username:"Lord_lucifer",password:"766521"}
]

/* REGISTER */

app.post("/register",(req,res)=>{

const {username,password}=req.body

const exist=users.find(u=>u.username===username)

if(exist){
return res.json({error:"User already exists"})
}

users.push({username,password})

res.json({success:true})

})

/* LOGIN */

app.post("/login",(req,res)=>{

const {username,password}=req.body

const user=users.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({error:"Invalid login"})
}

res.json({
success:true,
username:user.username
})

})

server.listen(process.env.PORT||3000)
