const socket = io()

let room = "normal"
let username = localStorage.getItem("user") || prompt("Enter username")

socket.emit("user",username)

function joinRoom(r){

room = r

socket.emit("join",room)

}

function addMsg(html){

let div = document.createElement("div")
div.className = "msg"
div.innerHTML = html

document.getElementById("messages").appendChild(div)

document.getElementById("messages").scrollTop =
document.getElementById("messages").scrollHeight

}

function sendMsg(){

let text = document.getElementById("text").value

if(!text) return

socket.emit("message",{
room:room,
user:username,
msg:text
})

document.getElementById("text").value=""

}

socket.on("message",(data)=>{

addMsg("<b>"+data.user+":</b> "+data.msg)

})

/* upload */

document.getElementById("file").onchange = function(){

let file = this.files[0]

let form = new FormData()
form.append("file",file)

let xhr = new XMLHttpRequest()

xhr.open("POST","/upload")

xhr.upload.onprogress = e => {

let p = Math.round((e.loaded/e.total)*100)

document.getElementById("progress").innerText = p+"%"

}

xhr.onload = () => {

let url = xhr.responseText

socket.emit("message",{
room:room,
user:username,
msg:"<img src='"+url+"'>"
})

}

xhr.send(form)

  }
