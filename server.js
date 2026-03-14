const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

const path = require("path")

// public folder serve
app.use(express.static(path.join(__dirname, "public")))

// home page
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"))
})

let users = {}

io.on("connection", (socket) => {

socket.on("join", (name) => {

users[socket.id] = name

io.emit("msg", {
name: "System",
text: name + " joined the chat"
})

})

socket.on("msg", (data) => {

io.emit("msg", data)

})

socket.on("disconnect", () => {

let name = users[socket.id]

if(name){

io.emit("msg", {
name: "System",
text: name + " left the chat"
})

}

delete users[socket.id]

})

})

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
