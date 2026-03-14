const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const { MongoClient } = require("mongodb")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

/* MongoDB connection */

const uri = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri)

let messagesCollection

async function startDB(){

await client.connect()

const db = client.db("tulipchat")

messagesCollection = db.collection("messages")

console.log("MongoDB connected")

}

startDB()

/* Socket connection */

io.on("connection", (socket)=>{

console.log("User connected")

socket.on("joinRoom", async(room)=>{

socket.join(room)

/* load old messages */

const oldMessages = await messagesCollection
.find({room:room})
.sort({time:1})
.limit(50)
.toArray()

socket.emit("oldMessages", oldMessages)

})

socket.on("chatMessage", async(data)=>{

const message = {
username:data.username,
room:data.room,
message:data.message,
time:new Date()
}

await messagesCollection.insertOne(message)

io.to(data.room).emit("message", message)

})

socket.on("disconnect",()=>{

console.log("User disconnected")

})

})

server.listen(3000, ()=>{

console.log("Server running")

})
