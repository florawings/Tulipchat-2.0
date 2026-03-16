const express=require("express")
const router=express.Router()

let reports=[]

router.post("/report",(req,res)=>{

const {reporter,user,reason}=req.body

reports.push({
reporter,
user,
reason,
time:Date.now()
})

res.json({msg:"report submitted"})
})

router.get("/all",(req,res)=>{
res.json(reports)
})

module.exports=router
