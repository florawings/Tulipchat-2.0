const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const { MongoClient } = require("mongodb")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use(express.json())

const PORT = process.env.PORT || 3000

/* ---------------- MongoDB ---------------- */

const uri =
"mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri)

let messages

async function connectDB() {

await client.connect()

const db = client.db("tulipchat")

messages = db.collection("messages")

/* auto delete messages after 2 hours */

await messages.createIndex(
{ createdAt: 1 },
{ expireAfterSeconds: 7200 }
)

console.log("MongoDB connected")

}

connectDB()

/* ---------------- USERS ---------------- */

let users = {}

/* ---------------- SOCKET ---------------- */

io.on("connection", (socket) => {

console.log("User connected")

/* JOIN ROOM */

socket.on("joinRoom", async (data) => {

const { username, room } = data

socket.join(room)

users[socket.id] = { username, room }

io.to(room).emit("system", username + " joined the room")

/* send last messages */

const old = await messages
.find({ room })
.sort({ createdAt: -1 })
.limit(20)
.toArray()

socket.emit("oldMessages", old.reverse())

})

/* MESSAGE */

socket.on("chatMessage", async (data) => {

const msg = {
username: data.username,
room: data.room,
message: data.message,
createdAt: new Date()
}

await messages.insertOne(msg)

io.to(data.room).emit("message", msg)

})

/* OWNER ACTIONS */

socket.on("kickUser", (user) => {

io.emit("system", user + " was kicked by owner")

})

socket.on("banUser", (user) => {

io.emit("system", user + " was banned by owner")

})

socket.on("muteUser", (user) => {

io.emit("system", user + " was muted by owner")

})

/* DISCONNECT */

socket.on("disconnect", () => {

const user = users[socket.id]

if (user) {

io.to(user.room).emit(
"system",
user.username + " left the room"
)

delete users[socket.id]

}

})

})

/* ---------------- START SERVER ---------------- */

server.listen(PORT, () => {

console.log("Server running on port " + PORT)

})
