const socket = io()

let username = localStorage.getItem("username")

if(!username){

username = prompt("Enter username")

localStorage.setItem("username",username)

}

let room = "normal"
let currentDM = null

socket.emit("join",{username,room})

/* ROOM JOIN */

function joinRoom(r){

room = r

socket.emit("join",{username,room})

document.getElementById("messages").innerHTML=""

}

/* SEND ROOM MESSAGE */

function sendMessage(){

let text = document.getElementById("text").value

if(!text) return

socket.emit("message",{

user:username,
msg:text,
room:room

})

document.getElementById("text").value=""

}

/* RECEIVE ROOM MESSAGE */

socket.on("message",(data)=>{

let box=document.getElementById("messages")

box.innerHTML += `<div><b>${data.user}</b>: ${data.msg}</div>`

box.scrollTop = box.scrollHeight

})

/* SYSTEM MESSAGE */

socket.on("system",(msg)=>{

let box=document.getElementById("messages")

box.innerHTML += `<div style="opacity:.6">${msg}</div>`

})

/* ONLINE USERS */

socket.on("online",(list)=>{

let box=document.getElementById("online")

box.innerHTML=""

list.forEach(u=>{

let div=document.createElement("div")

div.innerText=u

div.onclick=()=>openDM(u)

box.appendChild(div)

})

})

/* OPEN DM */

function openDM(user){

currentDM = user

document.getElementById("dmBox").style.display="block"

document.getElementById("dmUser").innerText="Chat with "+user

}

/* SEND DM */

function sendDM(){

let text=document.getElementById("dmText").value

socket.emit("dm",{

from:username,
to:currentDM,
msg:text

})

document.getElementById("dmMessages").innerHTML += `<div><b>Me:</b> ${text}</div>`

document.getElementById("dmText").value=""

}

/* RECEIVE DM */

socket.on("dm",(data)=>{

document.getElementById("dmMessages").innerHTML += `<div><b>${data.from}:</b> ${data.msg}</div>`

})
