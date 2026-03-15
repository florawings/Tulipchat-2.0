const mongoose = require("../database")

const userSchema = new mongoose.Schema({

username:{
type:String,
unique:true
},

password:String,

gender:String,

role:{
type:String,
default:"user"
}

})

module.exports = mongoose.model("User",userSchema)
