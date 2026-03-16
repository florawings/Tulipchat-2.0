const express = require("express")
const router = express.Router()

let users = []
let banned = []

router.get("/users",(req,res)=>{
res.json(users)
})

router.post("/kick/:name",(req,res)=>{

const name=req.params.name

users = users.filter(u=>u.username!==name)

res.send("kicked")

})

router.post("/ban/:name",(req,res)=>{

const name=req.params.name

banned.push(name)

users = users.filter(u=>u.username!==name)

res.send("banned")

})

router.post("/clear",(req,res)=>{

global.chatMessages=[]

res.send("chat cleared")

})

module.exports = router
