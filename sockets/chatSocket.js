const Message=require("../models/Message")

module.exports=(io,socket)=>{

socket.on("chat message",async(data)=>{

const msg=new Message({
user:data.user,
text:data.text,
time:new Date()
})

await msg.save()

io.emit("chat message",data)

})

}
