const socket = io();

let username = localStorage.getItem("username");

if(!username){
username = prompt("Enter name");
localStorage.setItem("username",username);
}

socket.emit("join",username);

const box = document.getElementById("messages");
const input = document.getElementById("messageInput");

function addMessage(m){

let div=document.createElement("div");

if(m.type==="system"){
div.innerHTML="<i>"+m.text+"</i>";
}

else if(m.type==="image"){
div.innerHTML="<b>"+m.user+":</b><br><img src='"+m.text+"' width='200'>";
}

else{
div.innerHTML="<b>"+m.user+":</b> "+m.text;
}

box.appendChild(div);
box.scrollTop=box.scrollHeight;

}

socket.on("oldMessages",(msgs)=>{
msgs.forEach(addMessage);
});

socket.on("message",(m)=>{
addMessage(m);
});

function sendMessage(){

let text=input.value;

if(!text) return;

socket.emit("message",{
user:username,
text:text,
type:"text"
});

input.value="";
}

function sendGIF(){

let url=prompt("Paste GIF link");

if(!url) return;

socket.emit("message",{
user:username,
text:url,
type:"image"
});

}

function logout(){
localStorage.removeItem("username");
location.href="login.html";
}
