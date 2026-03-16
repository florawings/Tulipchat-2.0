module.exports=(io)=>{

let onlineUsers=[]
let chatHistory=[]

io.on("connection",(socket)=>{

socket.on("join",(user)=>{

socket.username=user
onlineUsers.push(user)

io.emit("online",onlineUsers)

io.emit("message",{
system:true,
text:user+" joined the chat"
})

})

socket.on("message",(data)=>{

if(data.text==="/clear"){
chatHistory=[]
io.emit("clear")
return
}

chatHistory.push(data)

io.emit("message",data)

})

socket.on("disconnect",()=>{

onlineUsers=onlineUsers.filter(u=>u!==socket.username)

io.emit("online",onlineUsers)

io.emit("message",{
system:true,
text:socket.username+" left chat"
})

})

})

}
