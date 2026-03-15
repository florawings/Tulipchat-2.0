// public/client.js

const socket = io();

let username = localStorage.getItem("username");

if (!username) {
  username = prompt("Enter your name");
  localStorage.setItem("username", username);
}

socket.emit("join", username);

const messageBox = document.getElementById("messages");
const input = document.getElementById("messageInput");
const onlineBox = document.getElementById("onlineUsers");

function addMessage(data) {

  const div = document.createElement("div");

  if (data.type === "system") {
    div.innerHTML = "<i>" + data.text + "</i>";
  } else if (data.type === "image") {
    div.innerHTML =
      "<b>" + data.user + ":</b><br><img src='" + data.text + "' style='max-width:200px'>";
  } else {
    div.innerHTML = "<b>" + data.user + ":</b> " + data.text;
  }

  messageBox.appendChild(div);

  messageBox.scrollTop = messageBox.scrollHeight;
}

socket.on("oldMessages", (msgs) => {

  messageBox.innerHTML = "";

  msgs.forEach(m => addMessage(m));

});

socket.on("message", (data) => {

  addMessage(data);

});

function sendMessage() {

  const text = input.value.trim();

  if (!text) return;

  socket.emit("message", {
    user: username,
    text: text,
    type: "text"
  });

  input.value = "";

}

socket.on("onlineUsers", (users) => {

  onlineBox.innerHTML = "";

  users.forEach(u => {

    const div = document.createElement("div");

    div.innerText = u;

    div.onclick = () => openDM(u);

    onlineBox.appendChild(div);

  });

});

function openDM(user) {

  const msg = prompt("Send DM to " + user);

  if (!msg) return;

  socket.emit("dm", {
    from: username,
    to: user,
    text: msg
  });

}

socket.on("dm", (data) => {

  alert("DM from " + data.user + ": " + data.text);

});
