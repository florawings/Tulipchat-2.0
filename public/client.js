const socket = io()

/* USER DATA */

let username = localStorage.getItem("username")
let gender = localStorage.getItem("gender")

if(!username){
location.href="/login.html"
}

let room="normal"

/* JOIN ROOM */

socket.emit("join",{user:username,room,gender})

/* ROOM CHANGE */

function joinRoom(r){

room=r

document.getElementById("roomName").innerText=r+" room"

socket.emit("join",{user:username,room,gender})

}

/* SEND MESSAGE */

function send(){

let text=document.getElementById("text").value

if(!text) return

socket.emit("message",{
user:username,
msg:text,
room
})

document.getElementById("text").value=""

}

/* RECEIVE MESSAGE */

socket.on("message",(data)=>{

let div=document.createElement("div")

div.className="msg"

div.innerHTML="<b>"+data.user+"</b><br>"+data.msg

document.getElementById("messages").appendChild(div)

document.getElementById("messages").scrollTop=
document.getElementById("messages").scrollHeight

})

/* ONLINE USERS LIST */

socket.on("onlineUsers",(list)=>{

let box=document.getElementById("users")

box.innerHTML=""

for(let id in list){

let user=list[id]

let u=document.createElement("div")

u.className="user"

u.innerText=user.name+" ("+user.gender+")"

u.onclick=()=>{

let msg=prompt("Send DM to "+user.name)

if(msg){

socket.emit("dm",{
to:id,
from:username,
msg
})

}

}

box.appendChild(u)

}

})

/* RECEIVE DM */

socket.on("dm",(data)=>{

alert("DM from "+data.from+": "+data.msg)

})

/* TYPING */

document.getElementById("text").addEventListener("input",()=>{

socket.emit("typing",{user:username,room})

})

socket.on("typing",(user)=>{

document.getElementById("typing").innerText=user+" typing..."

setTimeout(()=>{
document.getElementById("typing").innerText=""
},2000)

})

/* IMAGE / GIF UPLOAD */

document.getElementById("file").onchange=function(){

let file=this.files[0]

let form=new FormData()

form.append("file",file)

let xhr=new XMLHttpRequest()

xhr.open("POST","/upload")

xhr.upload.onprogress=(e)=>{

let percent=Math.round((e.loaded/e.total)*100)

document.getElementById("progress").innerText=percent+"%"

}

xhr.onload=()=>{

let res=JSON.parse(xhr.responseText)

socket.emit("message",{
user:username,
msg:'<img src="'+res.url+'">',
room
})

document.getElementById("progress").innerText=""

}

xhr.send(form)

}
