const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())

/* PUBLIC FILES */

app.use(express.static(path.join(__dirname,"public")))

/* ROOT */

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public/login.html"))
})

/* PAGES */

app.get("/login",(req,res)=>{
res.sendFile(path.join(__dirname,"public/login.html"))
})

app.get("/register",(req,res)=>{
res.sendFile(path.join(__dirname,"public/register.html"))
})

app.get("/chat",(req,res)=>{
res.sendFile(path.join(__dirname,"public/chat.html"))
})

/* SOCKETS */

require("./sockets/chatSocket")(io)
require("./sockets/dmSocket")(io)

/* START SERVER */

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("Server running on "+PORT)
})
