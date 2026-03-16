const express=require("express")
const router=express.Router()

let banned=[]

router.post("/ban",(req,res)=>{
banned.push(req.body.username)
res.json({msg:"user banned"})
})

router.get("/banned",(req,res)=>{
res.json(banned)
})

module.exports=router
