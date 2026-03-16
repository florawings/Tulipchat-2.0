const socket = io()

function sendMessage(){

const msg = document.getElementById("msg").value

socket.emit("chat message",msg)

}

socket.on("chat message",(msg)=>{

const div = document.createElement("div")
div.innerText = msg

document.getElementById("chat").appendChild(div)

})
