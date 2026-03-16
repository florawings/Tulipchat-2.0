let onlineUsers=[]

module.exports=(io,socket)=>{

socket.on("join",(username)=>{

socket.username=username

if(!onlineUsers.includes(username)){
onlineUsers.push(username)
}

io.emit("onlineUsers",onlineUsers)

})

socket.on("chat",(msg)=>{

io.emit("chat",msg)

})

socket.on("disconnect",()=>{

onlineUsers=onlineUsers.filter(
u=>u!==socket.username
)

io.emit("onlineUsers",onlineUsers)

})

}
