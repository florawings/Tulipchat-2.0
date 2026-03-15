let users = {}
let messages = []
let dms = {}

io.on("connection",(socket)=>{

socket.on("join",(data)=>{

users[socket.id] = {
name:data.name,
gender:data.gender
}

io.emit("online",users)

messages.forEach(m=>{
socket.emit("message",m)
})

})

/* PUBLIC MESSAGE */

socket.on("message",(m)=>{

if(m.msg==="/clear"){

messages=[]

io.emit("clearChat")

return

}

messages.push(m)

if(messages.length>300){
messages.shift()
}

io.emit("message",m)

})

/* DM */

socket.on("dm",(data)=>{

let target=data.to
let msg=data.msg

if(!dms[target]){
dms[target]=[]
}

dms[target].push(data)

io.to(target).emit("dm",data)

})

})
