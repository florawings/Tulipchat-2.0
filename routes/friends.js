const express = require("express")
const router = express.Router()

let requests = []

router.post("/send",(req,res)=>{

const {from,to} = req.body

requests.push({from,to})

res.json({msg:"friend request sent"})

})

router.get("/list",(req,res)=>{

res.json(requests)

})

module.exports = router
