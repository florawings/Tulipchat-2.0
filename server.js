const express = require("express")
const app = express()
const path = require("path")

app.use(express.json())
app.use(express.static("public"))

let users = []

app.post("/register",(req,res)=>{

let {username,password,email,dob,gender,country}=req.body

if(!username || !password || !email || !dob){
return res.json({ok:false,msg:"Fill all fields"})
}

let age = new Date().getFullYear() - new Date(dob).getFullYear()

if(age < 18){
return res.json({ok:false,msg:"Only 18+ users allowed"})
}

let exist = users.find(u=>u.username==username)

if(exist){
return res.json({ok:false,msg:"Username already exists"})
}

users.push({
username,
password,
email,
dob,
gender,
country
})

res.json({ok:true})

})

app.post("/login",(req,res)=>{

let {username,password}=req.body

let user = users.find(u=>u.username==username && u.password==password)

if(!user){
return res.json({ok:false})
}

res.json({ok:true})

})

app.listen(3000,()=>console.log("Server running"))
