const socket=io()

let username=localStorage.getItem("username")

socket.emit("join",username)

/* SEND MESSAGE */

function send(){

 const msg=document.getElementById("msg").value

 socket.emit("chat",{
  user:username,
  text:msg
 })

 document.getElementById("msg").value=""

}

/* RECEIVE MESSAGE */

socket.on("chat",(msg)=>{

 const div=document.createElement("div")

 div.classList.add("msg")

 if(msg.user==="Lord_lucifer"){
 div.innerHTML="👑 "+msg.user+": "+msg.text
 }else{
 div.innerHTML=msg.user+": "+msg.text
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

socket.on("dm",(data)=>{

 document.getElementById("dmBell").innerText="🔔"

 const div=document.createElement("div")

 div.innerText=data.from+": "+data.text

 document.getElementById("dmMessages").appendChild(div)

})
