const mongoose = require("../database")

const userSchema = new mongoose.Schema({

username:{
type:String,
unique:true
},

email:String,

password:String,

gender:String,

role:{
type:String,
default:"user"
},

status:{
type:String,
default:"active"
},

blocked:[
{
type:String
}
]

})

module.exports = mongoose.model("User",userSchema)
