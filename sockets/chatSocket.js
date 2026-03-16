module.exports = (io)=>{

let users = []
let messages = []

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

socket.username = username

if(!users.includes(username)){
users.push(username)
}

io.emit("onlineUsers",users)

socket.emit("chatHistory",messages)

})

socket.on("chat",(msg)=>{

if(msg.text === "/clear"){
messages = []
io.emit("clearChat")
return
}

messages.push(msg)

io.emit("chat",msg)

})

socket.on("disconnect",()=>{

users = users.filter(
u => u !== socket.username
)

io.emit("onlineUsers",users)

})

})

}
