const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let users = {}

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        users[socket.id] = username
        io.emit("message", username + " joined")
    })

    socket.on("chat", (msg) => {
        io.emit("message", users[socket.id] + ": " + msg)
    })

    socket.on("disconnect", () => {
        if(users[socket.id]){
            io.emit("message", users[socket.id] + " left")
        }
    })

})

server.listen(3000, () => {
    console.log("Server running")
})
