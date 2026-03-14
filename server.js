const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json())
app.use(express.static("public"))

let users = []


// REGISTER
app.post("/register",(req,res)=>{

const {username,email,password,dob,country} = req.body

const birth = new Date(dob)
const age = new Date().getFullYear() - birth.getFullYear()

if(age < 18){
return res.json({success:false,message:"Only 18+ allowed"})
}

const exist = users.find(u=>u.username===username)

if(exist){
return res.json({success:false,message:"Username already exists"})
}

users.push({
username,
email,
password,
dob,
country
})

res.json({success:true})

})



// LOGIN
app.post("/login",(req,res)=>{

const {username,password} = req.body

const user = users.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({success:false})
}

res.json({success:true})

})



app.listen(3000,()=>{

console.log("Tulip Chat server running")

})
