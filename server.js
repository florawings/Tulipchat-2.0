const express = require("express")
const app = express()

const http = require("http").createServer(app)
const io = require("socket.io")(http)

const path = require("path")

// static files serve
app.use(express.static(path.join(__dirname)))

// home page (login page)
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "index.html"))
})

// users list
let users = {}

// socket connection
io.on("connection", (socket) => {

socket.on("join", (name) => {

users[socket.id] = name

io.emit("msg", {
name: "System",
text: name + " joined the chat"
})

})

// message send
socket.on("msg", (data) => {

io.emit("msg", data)

})

// disconnect
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

// port
const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
