const socket = io()

let room="normal"
let blocked=[]

let username=localStorage.getItem("user") || prompt("Enter username")

socket.emit("user",username)
socket.emit("join","normal")

function joinRoom(r){

if(r==="adult" && localStorage.getItem("age")!=="18"){
alert("18+ only")
return
}

room=r

document.getElementById("messages").innerHTML=""

socket.emit("join",room)

}

function addMsg(html){

let div=document.createElement("div")

div.className="msg"

div.innerHTML=html

document.getElementById("messages").appendChild(div)

}

function sendMsg(){

let text=document.getElementById("text").value

if(!text) return

socket.emit("message",{
room:room,
user:username,
msg:text
})

document.getElementById("text").value=""

}

socket.on("message",(data)=>{

if(blocked.includes(data.user)) return

addMsg("<b>"+data.user+":</b> "+data.msg+" <button onclick='blockUser(\""+data.user+"\")'>Block</button> <button onclick='reportUser(\""+data.user+"\")'>Report</button>")

})

function blockUser(user){

blocked.push(user)

alert(user+" blocked")

}

function reportUser(user){

socket.emit("report",{user:user,by:username})

alert("User reported")

}

/* upload */

document.getElementById("file").onchange=function(){

let file=this.files[0]

let form=new FormData()

form.append("file",file)

let xhr=new XMLHttpRequest()

xhr.open("POST","/upload")

xhr.upload.onprogress=e=>{

let p=Math.round((e.loaded/e.total)*100)

document.getElementById("progress").innerText=p+"%"

}

xhr.onload=()=>{

let url=xhr.responseText

socket.emit("message",{
room:room,
user:username,
msg:"<img src='"+url+"'>"
})

}

xhr.send(form)

  }
