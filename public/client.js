const socket = io()

let room="normal"
let username = localStorage.getItem("user") || prompt("username")

socket.emit("user",username)
socket.emit("join","normal")

function joinRoom(r){

room=r
document.getElementById("messages").innerHTML=""
socket.emit("join",room)

}

/* send message */

function sendMsg(){

let text=document.getElementById("text").value

if(!text)return

socket.emit("message",{
room:room,
user:username,
msg:text
})

document.getElementById("text").value=""

}

/* typing */

document.getElementById("text").addEventListener("keypress",()=>{
socket.emit("typing",{room:room,user:username})
})

socket.on("typing",(msg)=>{
document.getElementById("typing").innerText=msg
setTimeout(()=>{
document.getElementById("typing").innerText=""
},1000)
})

/* receive */

socket.on("message",(data)=>{

addMsg("<b>"+data.user+"</b>: "+data.msg)

})

/* emoji */

function emoji(e){
document.getElementById("text").value+=e
}

/* add message */

function addMsg(html){

let div=document.createElement("div")
div.className="msg"
div.innerHTML=html

document.getElementById("messages").appendChild(div)

}

/* gif */

function sendGif(){

let url=prompt("Paste GIF link")

socket.emit("message",{
room:room,
user:username,
msg:"<img src='"+url+"'>"
})

}

/* friend request */

function addFriend(user){

socket.emit("friend_request",{
from:username,
to:user
})

}

socket.on("friend_request",(data)=>{
alert(data.from+" sent friend request")
})
