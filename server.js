const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")

const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")
const friendRoutes = require("./routes/friends")
const reportRoutes = require("./routes/report")

const chatSocket = require("./sockets/chatSocket")
const dmSocket = require("./sockets/dmSocket")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/* OWNER SETTINGS */

const OWNER = "lord_lucifer"
const OWNER_PASS = "766521"
const SUPER_ADMIN = "Garima"

/* DATA STORAGE */

let onlineUsers = []
let bannedUsers = []
let mutedUsers = []

/* FILE UPLOAD */

const storage = multer.diskStorage({
destination: "uploads/",
filename: (req, file, cb) => {
cb(null, Date.now() + "-" + file.originalname)
}
})

const upload = multer({ storage })

app.post("/upload", upload.single("file"), (req, res) => {

res.json({
url: "/uploads/" + req.file.filename
})

})

/* ROUTES */

app.use("/auth", authRoutes)
app.use("/admin", adminRoutes)
app.use("/friends", friendRoutes)
app.use("/report", reportRoutes)

/* SOCKET CONNECTION */

io.on("connection", (socket) => {

console.log("User connected:", socket.id)

/* JOIN CHAT */

socket.on("join", (user) => {

if (bannedUsers.includes(user.username)) {
socket.emit("banned")
return
}

onlineUsers.push({
id: socket.id,
username: user.username,
ip: socket.handshake.address
})

io.emit("onlineUsers", onlineUsers)

socket.broadcast.emit("system", user.username + " joined the chat")

})

/* CHAT MESSAGE */

socket.on("chat message", (data) => {

if (mutedUsers.includes(data.username)) {
return
}

io.emit("chat message", data)

})

/* DM MESSAGE */

socket.on("dm", (data) => {

const target = onlineUsers.find(u => u.username === data.to)

if (target) {

io.to(target.id).emit("dm", data)

}

})

/* OWNER COMMANDS */

socket.on("ban", (username) => {

bannedUsers.push(username)

io.emit("system", username + " banned by owner")

})

socket.on("mute", (username) => {

mutedUsers.push(username)

io.emit("system", username + " muted")

})

socket.on("kick", (username) => {

const user = onlineUsers.find(u => u.username === username)

if (user) {

io.to(user.id).emit("kick")

}

})

socket.on("clearChat", () => {

io.emit("clearChat")

})

/* DISCONNECT */

socket.on("disconnect", () => {

onlineUsers = onlineUsers.filter(u => u.id !== socket.id)

io.emit("onlineUsers", onlineUsers)

})

})

/* SERVER START */

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {

console.log("Tulip Chat Server running on port " + PORT)

})
