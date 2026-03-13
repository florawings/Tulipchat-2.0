const express = require("express")
const app = express()

app.use(express.json())

let users = []

app.post("/register",(req,res)=>{

const {username,email,password,dob,gender,country} = req.body

if(!email || !password){
return res.json({ok:false})
}

users.push({
username,
email,
password,
dob,
gender,
country
})

res.json({ok:true})

})

app.post("/login",(req,res)=>{

const {username,password} = req.body

let user = users.find(u=>u.username==username && u.password==password)

if(user){
res.json({ok:true})
}else{
res.json({ok:false})
}

})

app.listen(3000)
