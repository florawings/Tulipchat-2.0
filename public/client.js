const socket=io()

function send(){

const msg=document.getElementById("msg").value

socket.emit("chat message",{
user:"guest",
text:msg
})

}

socket.on("chat message",(msg)=>{

const div=document.createElement("div")
div.innerText=msg.user+": "+msg.text

document.getElementById("chat").appendChild(div)

})
