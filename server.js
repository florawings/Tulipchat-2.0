const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const { MongoClient } = require("mongodb")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

/* static files */

app.use(express.static("public"))

/* PORT for Render */

const PORT = process.env.PORT || 3000

/* MongoDB */

const uri =
"mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri)

let messagesCollection

async function startDB(){

try{

await client.connect()

const db = client.db("tulipchat")

messagesCollection = db.collection("messages")

console.log("MongoDB connected")

}catch(err){

console.log("MongoDB error:",err)

}

}

startDB()

/* Socket connection */

io.on("connection",(socket)=>{

console.log("User connected")

/* join room */

socket.on("joinRoom", async(data)=>{

const room = data.room

socket.join(room)

try{

const oldMessages = await messagesCollection
.find({room:room})
.sort({time:1})
.limit(50)
.toArray()

socket.emit("oldMessages",oldMessages)

}catch(e){

console.log(e)

}

})

/* new message */

socket.on("chatMessage", async(data)=>{

const msg = {

username:data.username,
room:data.room,
message:data.message,
time:new Date()

}

try{

await messagesCollection.insertOne(msg)

}catch(e){

console.log(e)

}

io.to(data.room).emit("message",msg)

})

/* disconnect */

socket.on("disconnect",()=>{

console.log("User disconnected")

})

})

/* start server */

server.listen(PORT,()=>{

console.log("Server running on port "+PORT)

})
