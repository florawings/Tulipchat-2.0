const express = require("express")
const path = require("path")

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))

let messages = []

app.get("/messages",(req,res)=>{
res.json(messages)
})

app.post("/send",(req,res)=>{

let {user,msg} = req.body

messages.push({
user,
msg,
time:Date.now()
})

res.json({ok:true})

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
