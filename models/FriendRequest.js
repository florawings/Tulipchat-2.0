const mongoose=require("../database")

const schema=new mongoose.Schema({

from:String,
to:String,
status:{type:String,default:"pending"}

})

module.exports=mongoose.model("FriendRequest",schema)
