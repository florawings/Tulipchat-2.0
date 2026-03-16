const express = require("express")
const router = express.Router()

let users = []

router.post("/register",(req,res)=>{

const {username,password,email,age,gender} = req.body

users.push({
username,password,email,age,gender
})

res.json({msg:"registered"})

})

router.post("/login",(req,res)=>{

const {username,password} = req.body

const user = users.find(u=>u.username===username && u.password===password)

if(!user){
return res.json({error:"invalid login"})
}

res.json({msg:"login success",user})

})

module.exports = router
