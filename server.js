const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
const {MongoClient}=require("mongodb")

const app=express()
const server=http.createServer(app)
const io=new Server(server)

app.use(express.static("public"))

const PORT=process.env.PORT||3000

/* MongoDB */

const uri="YOUR_MONGODB_URL"

const client=new MongoClient(uri)

let messages

async function start(){

await client.connect()

const db=client.db("tulipchat")

messages=db.collection("messages")

await messages.createIndex(
{createdAt:1},
{expireAfterSeconds:7200}
)

console.log("Mongo connected")

}

start()

/* USERS */

let users={}

/* SOCKET */

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

users[socket.id]=username

io.emit("online",Object.values(users))

io.emit("system",username+" joined")

})

socket.on("message",async(data)=>{

const msg={
user:data.user,
text:data.text,
createdAt:new Date()
}

await messages.insertOne(msg)

io.emit("message",msg)

})

socket.on("image",(data)=>{

io.emit("image",data)

})

socket.on("dm",(data)=>{

io.to(data.to).emit("dm",data)

})

socket.on("disconnect",()=>{

let user=users[socket.id]

delete users[socket.id]

io.emit("online",Object.values(users))

if(user) io.emit("system",user+" left")

})

})

server.listen(PORT,()=>{

console.log("server running")

})
