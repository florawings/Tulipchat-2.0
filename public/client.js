console.log("CLIENT LOADED");

const socket = io();

const username = "User" + Math.floor(Math.random() * 1000);

socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);
  socket.emit("join", username);
});

const chat = document.getElementById("chat");
const usersDiv = document.getElementById("users");
const msgInput = document.getElementById("msg");

function send() {
  const text = msgInput.value;

  if (!text) return;

  socket.emit("msg", { user: username, text });

  msgInput.value = "";
}

socket.on("msg", (data) => {
  const div = document.createElement("div");
  div.innerText = data.user + ": " + data.text;
  chat.appendChild(div);
});

socket.on("users", (users) => {
  usersDiv.innerHTML = "Users: " + users.join(", ");
});

socket.on("oldMessages", (msgs) => {
  msgs.forEach(m => {
    const div = document.createElement("div");
    div.innerText = m.user + ": " + m.text;
    chat.appendChild(div);
  });
});
