const express = require("express")
const app = express()
const http = require("http").createServer(app)
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const io = new Server(http)

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads")
}

app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

let users = {}

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    url: "/uploads/" + req.file.filename
  })
})

io.on("connection", (socket) => {

  socket.on("join", (data) => {

    users[socket.id] = data

    io.emit("system", data.name + " joined the chat")

    io.emit("users", users)

  })

  socket.on("message", (data) => {

    io.emit("message", data)

  })

  socket.on("image", (data) => {

    io.emit("image", data)

  })

  socket.on("gif", (data) => {

    io.emit("gif", data)

  })

  socket.on("refresh", () => {

    io.emit("users", users)

  })

  socket.on("disconnect", () => {

    delete users[socket.id]

    io.emit("users", users)

  })

})

const PORT = process.env.PORT || 10000

http.listen(PORT, () => {

  console.log("Tulip Chat running on " + PORT)

})
