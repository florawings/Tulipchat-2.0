const express=require("express")
const router=express.Router()

let requests=[]
let friends={}

router.post("/send",(req,res)=>{
const {from,to}=req.body

requests.push({from,to})

res.json({msg:"friend request sent"})
})

router.post("/accept",(req,res)=>{
const {from,to}=req.body

if(!friends[from]) friends[from]=[]
if(!friends[to]) friends[to]=[]

friends[from].push(to)
friends[to].push(from)

requests=requests.filter(r=>!(r.from===from && r.to===to))

res.json({msg:"friend request accepted"})
})

router.get("/list/:user",(req,res)=>{
const user=req.params.user

res.json(friends[user]||[])
})

module.exports=router
