// connect socket
const socket = io();

// username
let username = localStorage.getItem("username");

if (!username) {
  username = prompt("Enter your name");
  localStorage.setItem("username", username);
}

// join chat
socket.emit("join", username);

// elements
const messageBox = document.getElementById("messages");
const input = document.getElementById("messageInput");
const onlineBox = document.getElementById("onlineUsers");

// add message to chat
function addMessage(data) {

  const div = document.createElement("div");
  div.className = "message";

  // system message
  if (data.type === "system") {

    div.innerHTML = "<i>" + data.text + "</i>";

  }

  // image or GIF
  else if (data.type === "image") {

    div.innerHTML =
      "<b>" + data.user + ":</b><br><img src='" +
      data.text +
      "' class='chatImage'>";

  }

  // normal text
  else {

    div.innerHTML =
      "<b>" + data.user + ":</b> " + data.text;

  }

  messageBox.appendChild(div);

  messageBox.scrollTop = messageBox.scrollHeight;

}

// receive old messages
socket.on("oldMessages", (msgs) => {

  messageBox.innerHTML = "";

  msgs.forEach(m => {

    addMessage(m);

  });

});

// receive new message
socket.on("message", (data) => {

  addMessage(data);

});

// send message
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

// enter key send
input.addEventListener("keypress", function(e){

  if(e.key === "Enter"){

    sendMessage();

  }

});

// online users
socket.on("onlineUsers", (users) => {

  onlineBox.innerHTML = "";

  users.forEach(u => {

    const div = document.createElement("div");

    div.innerText = u;

    div.onclick = () => openDM(u);

    onlineBox.appendChild(div);

  });

});

// open DM
function openDM(user){

  const msg = prompt("Send message to " + user);

  if(!msg) return;

  socket.emit("dm", {

    from: username,
    to: user,
    text: msg

  });

}

// receive DM
socket.on("dm", (data) => {

  alert("DM from " + data.user + ": " + data.text);

});
