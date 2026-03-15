const socket = io();

let username = localStorage.getItem("username");
if (!username) {
username = prompt("Enter username");
localStorage.setItem("username", username);
}

let room = "normal";
let currentDM = null;

socket.emit("join", { username, room });

/* Send room message */
function sendMessage() {
let text = document.getElementById("text").value;
if (!text) return;

socket.emit("message", { user: username, msg: text, room });
document.getElementById("text").value = "";
}

/* Receive message */
socket.on("message", (data) => {
let box = document.getElementById("messages");
box.innerHTML += "<div><b>${data.user}</b>: ${data.msg}</div>";
box.scrollTop = box.scrollHeight;
});

/* System message */
socket.on("system", (msg) => {
document.getElementById("messages").innerHTML += "<div style="opacity:.6">${msg}</div>";
});

/* Online users */
socket.on("online", (list) => {
let box = document.getElementById("online");
box.innerHTML = "";
list.forEach(u => {
let d = document.createElement("div");
d.innerText = u;
d.onclick = () => openDM(u);
box.appendChild(d);
});
});

/* Open DM */
function openDM(user) {
currentDM = user;
document.getElementById("dmBox").style.display = "block";
document.getElementById("dmUser").innerText = "Chat with " + user;
}

/* Send DM */
function sendDM() {
let text = document.getElementById("dmText").value;

socket.emit("dm", {
from: username,
to: currentDM,
msg: text
});

document.getElementById("dmMessages").innerHTML += "<div><b>Me:</b> ${text}</div>";
document.getElementById("dmText").value = "";
}

/* Receive DM */
socket.on("dm", (data) => {
document.getElementById("dmMessages").innerHTML += "<div><b>${data.from}:</b> ${data.msg}</div>";
});

/* File upload (GIF / image) */
document.getElementById("file").onchange = function () {
let file = this.files[0];
let form = new FormData();
form.append("file", file);

let xhr = new XMLHttpRequest();
xhr.open("POST", "/upload");

xhr.upload.onprogress = function (e) {
let percent = Math.round((e.loaded / e.total) * 100);
document.getElementById("progress").innerText = percent + "%";
};

xhr.onload = function () {
let res = JSON.parse(xhr.response);
let url = res.url;

socket.emit("message", {
  user: username,
  msg: `<img src="${url}" width="200">`,
  room
});

document.getElementById("progress").innerText = "";

};

xhr.send(form);
};
