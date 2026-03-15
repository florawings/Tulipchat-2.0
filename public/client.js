const socket=io()

let username=localStorage.getItem("username")
let gender=localStorage.getItem("gender")

if(!username){
location.href="/login.html"
}

socket.emit("join",{user:username,gender})

let currentDM=null

/* MENU */

document.getElementById("menu").onclick=()=>{
const s=document.getElementById("sidebar")
s.classList.toggle("open")
}

/* PUBLIC MESSAGE */

function send(){

let text=document.getElementById("text").value
if(!text) return

if(currentDM){

socket.emit("dmMessage",{room:currentDM,user:username,msg:text})

}else{

socket.emit("publicMessage",{user:username,msg:text})

}

document.getElementById("text").value=""
}

/* RECEIVE PUBLIC */

socket.on("publicMessage",(data)=>{

if(currentDM) return

let div=document.createElement("div")
div.className="msg "+(data.user===username?"me":"other")
div.innerText=data.user+": "+data.msg

document.getElementById("messages").appendChild(div)

})

/* ONLINE USERS */

socket.on("onlineUsers",(list)=>{

let box=document.getElementById("users")
box.innerHTML=""

for(let id in list){

let u=document.createElement("div")
u.className="user"
u.innerText=list[id].name+" ("+list[id].gender+")"

u.onclick=()=>{
socket.emit("startDM",{to:id,from:username})
}

box.appendChild(u)

}

})

/* OPEN DM */

socket.on("openDM",(data)=>{

currentDM=data.room
document.getElementById("title").innerText="DM with "+data.from
document.getElementById("messages").innerHTML=""

})

/* RECEIVE DM */

socket.on("dmMessage",(data)=>{

let div=document.createElement("div")
div.className="msg "+(data.user===username?"me":"other")
div.innerText=data.user+": "+data.msg

document.getElementById("messages").appendChild(div)

})
