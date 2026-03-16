const socket = io()

let username = localStorage.getItem("username") || "guest"

socket.emit("join", username)

/* SEND MESSAGE */

function send(){

const msg=document.getElementById("msg").value

socket.emit("chat", username+": "+msg)

document.getElementById("msg").value=""

}

/* RECEIVE CHAT */

socket.on("chat",(msg)=>{

const div=document.createElement("div")

div.innerText=msg

document.getElementById("chat").appendChild(div)

})

/* ONLINE USERS */

socket.on("onlineUsers",(users)=>{

const list=document.getElementById("onlineUsers")

if(!list) return

list.innerHTML=""

users.forEach(u=>{

const div=document.createElement("div")

div.innerText="🟢 "+u

list.appendChild(div)

})

})
