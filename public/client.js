const socket = io();

const chat = document.getElementById("chat");
const usersDiv = document.getElementById("users");
const msgInput = document.getElementById("msg");
const fileInput = document.getElementById("file");
const sendBtn = document.getElementById("sendBtn");

const dmBox = document.getElementById("dmBox");
const dmMsgs = document.getElementById("dmMsgs");
const dmInput = document.getElementById("dmInput");
const dmTop = document.getElementById("dmTop");

let currentDM = null;

const username = localStorage.getItem("user") || "User";

/* ADD MSG */
function addMsg(user, text, file){
const div = document.createElement("div");
div.className = "msg";

div.classList.add(user === username ? "me" : "other");

div.innerHTML = `<b>${user}</b><br>${text}`;

if(file){
const img = document.createElement("img");
img.src = file;
div.appendChild(img);
}

chat.appendChild(div);
chat.scrollTop = chat.scrollHeight;
}

/* SEND */
function send(){
const text = msgInput.value;
const file = fileInput.files[0];

if(!text && !file) return;

if(text){
socket.emit("msg",{user:username,text});
}

if(file){
const reader = new FileReader();

reader.onprogress = (e)=>{
if(e.lengthComputable){
let p = Math.round((e.loaded/e.total)*100);
sendBtn.innerText = p+"%";
}
};

reader.onload = ()=>{
sendBtn.innerText = "Send";
socket.emit("msg",{user:username,file:reader.result});
};

reader.readAsDataURL(file);
}

msgInput.value="";
fileInput.value="";
}

/* RECEIVE */
socket.on("msg",(data)=>{
addMsg(data.user,data.text,data.file);
});

/* USERS */
socket.on("users",(list)=>{
usersDiv.innerHTML="";
list.forEach(u=>{
const div=document.createElement("div");
div.className="user";
div.innerText=u;

div.onclick=()=>{
openDM(u);
};

usersDiv.appendChild(div);
});
});

/* DM OPEN */
function openDM(user){
currentDM=user;
dmBox.style.display="flex";
dmTop.innerText="DM: "+user;
dmMsgs.innerHTML="";
}

/* DM SEND */
dmInput.addEventListener("keypress",(e)=>{
if(e.key==="Enter"){
socket.emit("dm",{to:currentDM,text:dmInput.value,from:username});
dmMsgs.innerHTML+=`<div><b>Me:</b> ${dmInput.value}</div>`;
dmInput.value="";
}
});

/* DM RECEIVE */
socket.on("dm",(data)=>{
if(data.from===currentDM){
dmMsgs.innerHTML+=`<div><b>${data.from}:</b> ${data.text}</div>`;
}
});

/* LOGOUT */
function logout(){
localStorage.removeItem("user");
window.location="/login.html";
}
