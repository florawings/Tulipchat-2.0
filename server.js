const express = require("express")
const app = express()

app.use(express.json())
app.use(express.static("public"))

let users=[]
let messages=[]
let privateMessages=[]
let notifications=[]

app.post("/register",(req,res)=>{

let {username,password,email,dob,gender,country}=req.body

if(!username || !password || !email || !dob){
return res.json({ok:false,msg:"Fill all fields"})
}

let age=new Date().getFullYear()-new Date(dob).getFullYear()

if(age<18){
return res.json
