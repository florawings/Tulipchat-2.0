const mongoose = require("../database")

const userSchema = new mongoose.Schema({

username:{
type:String,
unique:true
},

age:Number,

gender:String,

email:String,

role:{
type:String,
default:"user"
},

status:{
type:String,
default:"active"
}

})

module.exports = mongoose.model("User",userSchema)
