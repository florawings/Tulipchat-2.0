const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({

username:{type:String,unique:true},
age:Number,
gender:String,
email:String,
password:String,

photo:{
type:String,
default:"/uploads/default.png"
},

role:{
type:String,
default:"user"
}

})

module.exports=mongoose.model("User",userSchema)
