const express=require("express")
const router=express.Router()
const bcrypt=require("bcryptjs")

const User=require("../models/User")

// REGISTER
router.post("/register",async(req,res)=>{

try{

const {username,age,gender,email,password}=req.body

const exist=await User.findOne({username})

if(exist){
return res.json({error:"Username already exists"})
}

const hash=await bcrypt.hash(password,10)

await User.create({
username,
age,
gender,
email,
password:hash
})

res.json({msg:"registered"})

}catch(err){
res.json({error:"register error"})
}

})


// LOGIN
router.post("/login",async(req,res)=>{

try{

const {username,password}=req.body

// OWNER LOGIN
if(username==="Lord_lucifer" && password==="766521"){

return res.json({
username:"Lord_lucifer",
role:"owner"
})

}

const user=await User.findOne({username})

if(!user){
return res.json({error:"user not found"})
}

const ok=await bcrypt.compare(password,user.password)

if(!ok){
return res.json({error:"wrong password"})
}

res.json({
username:user.username,
role:"user"
})

}catch(err){
res.json({error:"login error"})
}

})

module.exports=router
