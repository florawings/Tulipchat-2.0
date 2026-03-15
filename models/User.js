const mongoose=require("../database")

const schema=new mongoose.Schema({

username:{type:String,unique:true},
age:Number,
gender:String,
email:String,
password:String,
role:{type:String,default:"user"},
avatar:String

})

module.exports=mongoose.model("User",schema)
