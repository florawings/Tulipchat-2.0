const socket = io()

let username = localStorage.getItem("username")

if(!username){

username = prompt("Enter name")
localStorage.setItem("username",username)

}

document.getElementById("username").innerText=username

socket.emit("join",username)

const messages = document.getElementById("messages")

let blockedUsers=[]

function addMessage(data){

if(blockedUsers.includes(data.user)) return

let div=document.createElement("div")

if(data.type==="system"){

div.className="system"
div.innerText=data.text

}else{

div.className="message"

if(data.user===username) div.classList.add("my")

div.innerText=data.user + ": " + data.text

}

messages.appendChild(div)
messages.scrollTop=messages.scrollHeight

}

socket.on("chat message",(data)=>{

addMessage(data)

})

function sendMsg(){

let input=document.getElementById("msgInput")

socket.emit("chat message",{
user:username,
text:input.value
})

input.value=""

}

socket.on("users",(list)=>{

let usersDiv=document.getElementById("users")

usersDiv.innerHTML=""

list.forEach(u=>{

let div=document.createElement("div")

div.className="user"
div.innerText=u

div.onclick=()=>openDM(u)

usersDiv.appendChild(div)

})

})

socket.on("onlineCount",(count)=>{

document.getElementById("onlineCount").innerText=
count + " users online"

})

function sendGift(g){

socket.emit("send gift",{
user:username,
gift:g
})

}

socket.on("gift",(data)=>{

let div=document.createElement("div")

div.className="gift"

div.innerText=data.user + " sent " + data.gift

messages.appendChild(div)

})

socket.on("friend request",(data)=>{

alert(data.from + " sent you a friend request")

})

function blockUser(user){

blockedUsers.push(user)

}

document.getElementById("profileUpload").addEventListener("change",function(){

const file=this.files[0]

const reader=new FileReader()

reader.onload=function(){

localStorage.setItem("profilePic",reader.result)

document.getElementById("profileImg").src=reader.result

}

reader.readAsDataURL(file)

})
