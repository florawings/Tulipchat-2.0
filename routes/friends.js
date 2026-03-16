const express=require("express")
const router=express.Router()

let requests=[]

router.post("/send",(req,res)=>{
requests.push(req.body)
res.json({msg:"request sent"})
})

router.get("/list",(req,res)=>{
res.json(requests)
})

module.exports=router
