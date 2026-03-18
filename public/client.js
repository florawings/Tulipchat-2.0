const socket = io();

const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const fileInput = document.getElementById("file");

const username = localStorage.getItem("user") || "User";

/* ADD MESSAGE */
function addMsg(user, text, file){
const div = document.createElement("div");
div.className = "msg";

if(user === username){
div.classList.add("me");
}else{
div.classList.add("other");
}

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

/* TEXT */
if(text){
socket.emit("msg", {
user: username,
text: text
});
}

/* FILE */
if(file){
const reader = new FileReader();

reader.onload = ()=>{
socket.emit("msg", {
user: username,
text: "",
file: reader.result
});
};

reader.readAsDataURL(file);
}

msgInput.value = "";
fileInput.value = "";
}

/* RECEIVE */
socket.on("msg", (data)=>{
addMsg(data.user, data.text, data.file);
});

/* ENTER SEND */
msgInput.addEventListener("keypress", (e)=>{
if(e.key === "Enter"){
send();
}
});

/* LOGOUT */
function logout(){
localStorage.removeItem("user");
window.location.href = "/login.html";
}
