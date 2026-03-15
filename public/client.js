const socket = io()

let username = localStorage.getItem("username")

if(!username){

username = prompt("Enter name")

localStorage.setItem("username",username)

}

socket.emit("join",username)

const messages = document.getElementById("messages")
const usersDiv = document.getElementById("users")

function addMessage(data){

let div = document.createElement("div")

if(data.type==="system"){

div.className="system"
div.innerText=data.text

}else{

div.className="message"

if(data.user===username) div.classList.add("my")

if(data.type==="image"){

div.innerHTML="<b>"+data.user+"</b><br><img src='"+data.text+"'>"

}else{

div.innerHTML="<b>"+data.user+"</b>: "+data.text

}

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
text:input.value,
type:"text"
})

input.value=""

}

socket.on("users",(list)=>{

usersDiv.innerHTML=""

list.forEach(u=>{

let div=document.createElement("div")

div.className="user"
div.innerText=u

usersDiv.appendChild(div)

})

})

function openImage(){
document.getElementById("imageUpload").click()
}

document.getElementById("imageUpload").addEventListener("change",function(){

const file=this.files[0]

const reader=new FileReader()

reader.onload=function(){

socket.emit("chat message",{
user:username,
text:reader.result,
type:"image"
})

}

reader.readAsDataURL(file)

})

function openGif(){
document.getElementById("gifUpload").click()
}

document.getElementById("gifUpload").addEventListener("change",function(){

const file=this.files[0]

const reader=new FileReader()

reader.onload=function(){

socket.emit("chat message",{
user:username,
text:reader.result,
type:"image"
})

}

reader.readAsDataURL(file)

})

function toggleEmoji(){

let panel=document.getElementById("emojiPanel")

panel.style.display = panel.style.display==="block"?"none":"block"

}

function addEmoji(e){

document.getElementById("msgInput").value+=e

}
