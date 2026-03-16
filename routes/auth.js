const express=require("express")
const router=express.Router()
const User=require("../models/User")

const OWNER="Lord_lucifer"
const OWNER_PASS="766521"

router.post("/login",async(req,res)=>{

const {username,password}=req.body

/* OWNER LOGIN */

if(username===OWNER && password===OWNER_PASS){

return res.json({
username:OWNER,
role:"owner"
})

}

/* NORMAL USER */

const user=await User.findOne({
username:username,
password:password
})

if(!user){
return res.json({error:"Invalid login"})
}

res.json({
username:user.username,
role:"user"
})

})

module.exports=router
