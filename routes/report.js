const express = require("express")
const router = express.Router()

let reports = []

router.post("/create",(req,res)=>{

reports.push(req.body)

res.json({msg:"reported"})

})

router.get("/all",(req,res)=>{

res.json(reports)

})

module.exports = router
