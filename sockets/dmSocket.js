module.exports = (io)=>{

io.on("connection",(socket)=>{

socket.on("joinDM",(username)=>{
socket.username = username
})

socket.on("dm",(data)=>{

io.emit("dm",{
from: data.from,
to: data.to,
text: data.text
})

})

})

}
