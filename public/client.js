const socket = io()

let username = localStorage.getItem("username") || "guest"

/* ---------- JOIN ---------- */

socket.emit("join", username)

/* ---------- SIDEBAR ---------- */

function toggleSidebar(){
 const sidebar = document.getElementById("sidebar")
 sidebar.classList.toggle("open")
}

/* ---------- SEND MESSAGE ---------- */

function send(){

 const input = document.getElementById("msg")
 const msg = input.value.trim()

 if(!msg) return

 socket.emit("chat", username + ": " + msg)

 input.value=""
}

/* ---------- IMAGE SEND ---------- */

function sendImage(){

 const file = document.getElementById("imgFile").files[0]

 if(!file) return

 const form = new FormData()
 form.append("image", file)

 fetch("/upload",{
  method:"POST",
  body:form
 })
 .then(res=>res.json())
 .then(data=>{
  socket.emit("chat", username + ": " + data.url)
 })
}

/* ---------- RECEIVE CHAT ---------- */

socket.on("chat",(msg)=>{

 const div=document.createElement("div")

 /* GIF */

 if(msg.includes(".gif")){
  div.innerHTML=`<img src="${msg.split(" ").pop()}" width="200">`
 }

 /* IMAGE */

 else if(msg.includes(".png")||msg.includes(".jpg")||msg.includes(".jpeg")){
  div.innerHTML=`<img src="${msg.split(" ").pop()}" width="200">`
 }

 else{
  div.innerText=msg
 }

 document.getElementById("chat").appendChild(div)

})

/* ---------- ONLINE USERS ---------- */

socket.on("onlineUsers",(users)=>{

 const list=document.getElementById("onlineUsers")

 if(!list) return

 list.innerHTML=""

 users.forEach(u=>{

  const div=document.createElement("div")
  div.className="user"
  div.innerText="🟢 "+u

  div.onclick=()=>openDM(u)

  list.appendChild(div)

 })

})

/* ---------- DM SYSTEM ---------- */

let currentDM=null

function openDM(user){

 currentDM=user

 document.getElementById("dmPopup").style.display="block"

}

function closeDM(){

 document.getElementById("dmPopup").style.display="none"

}

function sendDM(){

 const msg=document.getElementById("dmInput").value

 if(!msg) return

 socket.emit("dm",{
  to:currentDM,
  from:username,
  msg:msg
 })

 document.getElementById("dmInput").value=""

}

/* RECEIVE DM */

socket.on("dm",(data)=>{

 const bell=document.getElementById("dmBell")

 if(bell){
  bell.innerText="🔔"
 }

 const div=document.createElement("div")

 div.innerText=data.from + ": " + data.msg

 const box=document.getElementById("dmMessages")

 if(box){
  box.appendChild(div)
 }

})

/* ---------- OWNER PANEL ---------- */

if(username==="Lord_lucifer"){

 const ownerBtn=document.getElementById("ownerPanel")

 if(ownerBtn){
  ownerBtn.style.display="block"
 }

}
