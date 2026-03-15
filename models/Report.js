const mongoose=require("../database")

const schema=new mongoose.Schema({

reporter:String,
target:String,
reason:String,
time:{type:Date,default:Date.now}

})

module.exports=mongoose.model("Report",schema)
