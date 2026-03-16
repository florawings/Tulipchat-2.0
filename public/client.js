const socket=io()

let username=localStorage.getItem("username")

if(!username){

 username=prompt("Enter username")

 localStorage.setItem("username",username)

}

socket.emit("join",username)

/* SEND MESSAGE */

function send(){

 const msg=document.getElementById("msg").value

 if(msg==="") return

 socket.emit("chat",{
  user:username,
  text:msg
 })

 document.getElementById("msg").value=""

}

/* RECEIVE MESSAGE */

socket.on("chat",(msg)=>{

 const div=document.createElement("div")

 if(msg.image){

  const img=document.createElement("img")
  img.src=msg.image
  img.style.maxWidth="200px"

  div.appendChild(img)

 }else{

  if(msg.user==="Lord_lucifer"){
   div.innerHTML="👑 "+msg.user+": "+msg.text
  }else{
   div.innerHTML=msg.user+": "+msg.text
  }

 }

 document.getElementById("chat").appendChild(div)

})

/* ONLINE USERS */

socket.on("onlineUsers",(users)=>{

 const box=document.getElementById("onlineUsers")

 box.innerHTML=""

 users.forEach(u=>{

  const div=document.createElement("div")

  div.innerText="🟢 "+u

  div.onclick=()=>openDM(u)

  box.appendChild(div)

 })

})

/* IMAGE / GIF */

function sendImage(){

 const file=document.getElementById("imgFile").files[0]

 const reader=new FileReader()

 reader.onload=function(){

  socket.emit("chat",{
   user:username,
   image:reader.result
  })

 }

 reader.readAsDataURL(file)

}

/* DM */

function sendDM(){

 const msg=document.getElementById("dmInput").value

 const to=document.getElementById("dmUser").value

 socket.emit("dm",{
  from:username,
  to:to,
  text:msg
 })

}

/* RECEIVE DM */

socket.on("dm",(data)=>{

 document.getElementById("dmBell").innerText="🔔"

 const div=document.createElement("div")

 div.innerText=data.from+": "+data.text

 document.getElementById("dmMessages").appendChild(div)

})

/* CLEAR CHAT */

socket.on("clearChat",()=>{
 document.getElementById("chat").innerHTML=""
})

/* SIDEBAR */

function toggleMenu(){

 const bar=document.getElementById("sidebar")

 if(bar.style.display==="none"){
  bar.style.display="block"
 }else{
  bar.style.display="none"
 }

}

function openDM(user){

 document.getElementById("dmPopup").style.display="block"

 document.getElementById("dmUser").value=user

}
