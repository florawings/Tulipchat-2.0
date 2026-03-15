const socket = io()

/* USER DATA */

let username = localStorage.getItem("username")
let gender = localStorage.getItem("gender")

if(!username){
location.href="/login.html"
}

let room="normal"
let currentDM=null

/* JOIN ROOM */

socket.emit("join",{user:username,room,gender})

/* ROOM CHANGE */

function joinRoom(r){

currentDM=null

room=r

document.getElementById("roomName").innerText=r+" room"

document.getElementById("messages").innerHTML=""

socket.emit("join",{user:username,room,gender})

}

/* DM STORAGE */

function saveDM(room,msg){

let key="dm_"+room

let arr=JSON.parse(localStorage.getItem(key) || "[]")

arr.push(msg)

localStorage.setItem(key,JSON.stringify(arr))

}

function loadDM(room){

let key="dm_"+room

return JSON.parse(localStorage.getItem(key) || "[]")

}

/* SEND MESSAGE */

function send(){

let text=document.getElementById("text").value

if(!text) return

if(currentDM){

socket.emit("dmMessage",{
room:currentDM,
user:username,
msg:text
})

}else{

socket.emit("message",{
user:username,
msg:text,
room
})

}

document.getElementById("text").value=""

}

/* RECEIVE PUBLIC MESSAGE */

socket.on("message",(data)=>{

let div=document.createElement("div")

div.className="msg"

div.innerHTML="<b>"+data.user+"</b><br>"+data.msg

document.getElementById("messages").appendChild(div)

document.getElementById("messages").scrollTop=
document.getElementById("messages").scrollHeight

})

/* ONLINE USERS */

socket.on("onlineUsers",(list)=>{

let box=document.getElementById("users")

box.innerHTML=""

for(let id in list){

let user=list[id]

let u=document.createElement("div")

u.className="user"

u.innerText=user.name+" ("+user.gender+")"

u.onclick=()=>{

socket.emit("startDM",{
to:id,
from:username
})

}

box.appendChild(u)

}

})

/* OPEN DM */

socket.on("openDM",(data)=>{

currentDM=data.room

document.getElementById("roomName").innerText="DM with "+data.from

document.getElementById("messages").innerHTML=""

/* LOAD OLD CHAT */

let history=loadDM(currentDM)

history.forEach(m=>{

let div=document.createElement("div")

div.className="msg"

div.innerHTML="<b>"+m.user+"</b><br>"+m.msg

document.getElementById("messages").appendChild(div)

})

})

/* RECEIVE DM */

socket.on("dmMessage",(data)=>{

let div=document.createElement("div")

div.className="msg"

div.innerHTML="<b>"+data.user+"</b><br>"+data.msg

document.getElementById("messages").appendChild(div)

/* SAVE HISTORY */

saveDM(data.room,data)

document.getElementById("messages").scrollTop=
document.getElementById("messages").scrollHeight

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

let msg='<img src="'+res.url+'">'

if(currentDM){

socket.emit("dmMessage",{
room:currentDM,
user:username,
msg:msg
})

}else{

socket.emit("message",{
user:username,
msg:msg,
room
})

}

document.getElementById("progress").innerText=""

}

xhr.send(form)

  }
