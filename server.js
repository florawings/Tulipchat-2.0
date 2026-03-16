const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/* ---------- FILE UPLOAD ---------- */

const storage = multer.diskStorage({
 destination: "uploads",
 filename: (req, file, cb) => {
  cb(null, Date.now() + "_" + file.originalname)
 }
})

const upload = multer({ storage })

app.post("/upload", upload.single("photo"), (req, res) => {

 if (!req.file) {
  return res.json({ error: "no file" })
 }

 res.json({
  url: "/uploads/" + req.file.filename
 })

})

/* ---------- SOCKET CHAT ---------- */

let onlineUsers = []

io.on("connection", (socket) => {

 console.log("user connected")

 socket.on("join", (username) => {

  socket.username = username

  if (!onlineUsers.includes(username)) {
   onlineUsers.push(username)
  }

  io.emit("onlineUsers", onlineUsers)

  io.emit("chat", username + " joined the chat")

 })

 socket.on("chat", (msg) => {

  io.emit("chat", msg)

 })

 socket.on("disconnect", () => {

  onlineUsers = onlineUsers.filter(u => u !== socket.username)

  io.emit("onlineUsers", onlineUsers)

 })

})

/* ---------- START SERVER ---------- */

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
 console.log("Tulip Chat server running on port " + PORT)
})
