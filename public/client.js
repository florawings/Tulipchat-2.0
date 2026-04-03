const socket = io();
const username = "User" + Math.floor(Math.random()*1000);

socket.emit("join", username);

const chat = document.getElementById("chat");
const usersDiv = document.getElementById("users");

function send(){
  const text = msg.value;
  const file = document.getElementById("file").files[0];

  if(file){
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST","/upload");

    xhr.upload.onprogress = (e)=>{
      if(e.lengthComputable){
        console.log("Upload:", Math.round((e.loaded/e.total)*100)+"%");
      }
    };

    xhr.onload = ()=>{
      const res = JSON.parse(xhr.response);
      socket.emit("msg",{user:username,file:res.url});
    };

    xhr.send(formData);
  }

  if(text){
    socket.emit("msg",{user:username,text});
    msg.value="";
  }
}

/* 🔥 MESSAGE */
socket.on("msg",(d)=>{
  const div = document.createElement("div");
  div.className="msg"+(d.user===username?" me":"");

  if(d.text) div.innerText = d.user+": "+d.text;
  if(d.file){
    const img = document.createElement("img");
    img.src=d.file;
    img.style.width="150px";
    div.appendChild(img);
  }

  chat.appendChild(div);
});

/* 🔥 USERS */
socket.on("users",(users)=>{
  usersDiv.innerHTML="";
  users.forEach(u=>{
    const d=document.createElement("div");
    d.className="user";
    d.innerText=u;

    d.onclick=()=>{
      const msg = prompt("DM to "+u);
      socket.emit("dm",{to:u,msg});
    };

    usersDiv.appendChild(d);
  });
});

/* 🔥 DM */
socket.on("dm",(msg)=>{
  alert("DM: "+msg);
});

/* 🔥 OLD */
socket.on("oldMessages",(msgs)=>{
  msgs.forEach(m=>socket.emit("msg",m));
});
