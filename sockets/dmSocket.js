let unread={}

module.exports=(io,socket)=>{

socket.on("dm",(data)=>{

const {to,message}=data

if(!unread[to]){
unread[to]=0
}

unread[to]++

io.emit("dmMessage",data)
io.emit("dmBadge",{user:to,count:unread[to]})

})

socket.on("readDM",(user)=>{

unread[user]=0

})

}
