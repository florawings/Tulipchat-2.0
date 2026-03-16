const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
username:String,
password:String,
email:String,
age:Number,
gender:String,
photo:String
})

module.exports=mongoose.model("User",userSchema)
