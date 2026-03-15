const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let users = {}
let messages = []

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

socket.join(data.room)

users[socket.id] = {
name:data.username,
room:data.room
}

io.to(data.room).emit("system",data.username+" joined "+data.room)

updateUsers(data.room)

})

socket.on("message",(data)=>{

data.time = Date.now()

messages.push(data)

io.to(data.room).emit("message",data)

})

socket.on("disconnect",()=>{

let user = users[socket.id]

if(user){

io.to(user.room).emit("system",user.name+" left")

delete users[socket.id]

updateUsers(user.room)

}

})

})

function updateUsers(room){

let list = []

for(let id in users){

if(users[id].room==room){

list.push(users[id].name)

}

}

io.to(room).emit("online",list)

}

/* auto delete 30 min messages */

setInterval(()=>{

let now = Date.now()

messages = messages.filter(m => now-m.time < 1800000)

},60000)

http.listen(3000)
