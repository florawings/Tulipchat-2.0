module.exports=(io,socket)=>{

socket.on("dm",(data)=>{
io.to(data.to).emit("dm",data)
})

}
