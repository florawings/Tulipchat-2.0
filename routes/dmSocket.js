module.exports=(io)=>{

let userSockets={}

io.on("connection",(socket)=>{

socket.on("register",(username)=>{
userSockets[username]=socket.id
})

socket.on("dm",(data)=>{

const target=userSockets[data.to]

if(target){
io.to(target).emit("dm",data)
}

})

socket.on("disconnect",()=>{

for(const user in userSockets){
if(userSockets[user]===socket.id){
delete userSockets[user]
}
}

})

})

}
