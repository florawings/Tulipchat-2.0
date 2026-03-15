const socket = io()

let username = localStorage.getItem("username")

if(!username){
username = prompt("Enter your name")
localStorage.setItem("username",username)
}

let room="normal"

socket.emit("join",{user:username,room})

function joinRoom(r){

room=r

document.getElementById("roomName").innerText=r+" room"

socket.emit("join",{user:username,room})

}

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

socket.on("message",(data)=>{

let div=document.createElement("div")

div.className="msg"

div.innerHTML="<b>"+data.user+"</b>: "+data.msg

document.getElementById("messages").appendChild(div)

})

socket.on("onlineUsers",(list)=>{

let box=document.getElementById("users")

box.innerHTML=""

for(let id in list){

let u=document.createElement("div")

u.className="user"

u.innerText=list[id]

u.onclick=()=>{

let msg=prompt("Send DM to "+list[id])

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

socket.on("dm",(data)=>{

alert("DM from "+data.from+": "+data.msg)

})

document.getElementById("text").addEventListener("input",()=>{

socket.emit("typing",{user:username,room})

})

socket.on("typing",(user)=>{

document.getElementById("typing").innerText=user+" typing..."

setTimeout(()=>{
document.getElementById("typing").innerText=""
},2000)

})

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
