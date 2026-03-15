const socket = io()

let username = localStorage.getItem("username")

socket.emit("join",username)

function sendMsg(){

let input=document.getElementById("msgInput")

socket.emit("chat message",{

user:username,
text:input.value

})

input.value=""

}

socket.on("chat message",(data)=>{

let div=document.createElement("div")

div.innerText=data.user+": "+data.text

document.getElementById("messages").appendChild(div)

})

socket.on("onlineUsers",(list)=>{

let div=document.getElementById("users")

div.innerHTML=""

list.forEach(u=>{

let d=document.createElement("div")

d.innerText=u

div.appendChild(d)

})

})
