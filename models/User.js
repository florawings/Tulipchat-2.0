const mongoose = require("../database")

const UserSchema = new mongoose.Schema({

username:String,
avatar:String,
friends:[String],
requests:[String]

})

module.exports = mongoose.model("User",UserSchema)
