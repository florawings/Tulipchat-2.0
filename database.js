const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1/tulipchat")

mongoose.connection.on("connected",()=>{
console.log("Database connected")
})

module.exports = mongoose
