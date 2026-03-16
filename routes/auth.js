const express=require("express")
const router=express.Router()
const User=require("../models/User")

router.post("/register",async(req,res)=>{

const user=new User(req.body)
await user.save()

res.json({msg:"registered"})

})

router.post("/login",async(req,res)=>{

const user=await User.findOne({
username:req.body.username,
password:req.body.password
})

if(!user){
return res.json({error:"login failed"})
}

res.json(user)

})

module.exports=router
