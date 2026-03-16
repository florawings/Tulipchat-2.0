const express=require("express")
const router=express.Router()

let bannedUsers=[]
let mutedUsers=[]

router.post("/ban",(req,res)=>{
const {username}=req.body

if(!username){
return res.json({error:"username required"})
}

bannedUsers.push(username)

res.json({msg:username+" banned"})
})

router.post("/mute",(req,res)=>{
const {username}=req.body

mutedUsers.push(username)

res.json({msg:username+" muted"})
})

router.post("/unmute",(req,res)=>{
const {username}=req.body

mutedUsers=mutedUsers.filter(u=>u!==username)

res.json({msg:username+" unmuted"})
})

router.post("/kick",(req,res)=>{
const {username}=req.body

res.json({msg:username+" kicked"})
})

router.get("/banned",(req,res)=>{
res.json(bannedUsers)
})

router.get("/muted",(req,res)=>{
res.json(mutedUsers)
})

module.exports=router
