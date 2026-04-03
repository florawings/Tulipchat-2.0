const socket = io();

let username = localStorage.getItem("username") || prompt("Enter username");
localStorage.setItem("username", username);

const msgInput = document.getElementById("msg");
const messages = document.getElementById("messages");
const fileInput = document.getElementById("file");
const progressDiv = document.getElementById("progress");
const usersList = document.getElementById("users");

// JOIN
socket.emit("join", username);

// RECEIVE MESSAGES
socket.on("message", (data) => {
  addMessage(data);
});

// LOAD OLD MESSAGES
socket.on("loadMessages", (msgs) => {
  messages.innerHTML = "";
  msgs.forEach(addMessage);
});

// ONLINE USERS
socket.on("users", (users) => {
  usersList.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.innerText = u;

    li.onclick = () => openDM(u);

    usersList.appendChild(li);
  });
});

// SEND MESSAGE
function sendMsg() {
  const text = msgInput.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  // TEXT MESSAGE
  if (text) {
    socket.emit("message", {
      user: username,
      text
    });
  }

  // FILE UPLOAD
  if (file) {
    uploadFile(file);
  }

  msgInput.value = "";
  fileInput.value = "";
}

// ADD MESSAGE UI
function addMessage(data) {
  const div = document.createElement("div");
  div.className = "msg";

  if (data.type === "image") {
    div.innerHTML = `<b>${data.user}:</b><br><img src="${data.url}" width="150">`;
  } else {
    div.innerHTML = `<b>${data.user}:</b> ${data.text}`;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// FILE UPLOAD WITH %
function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();

  xhr.open("POST", "/upload", true);

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      let percent = Math.round((e.loaded / e.total) * 100);
      progressDiv.innerText = "Uploading: " + percent + "%";
    }
  };

  xhr.onload = function () {
    progressDiv.innerText = "";

    const res = JSON.parse(xhr.responseText);

    socket.emit("message", {
      user: username,
      type: "image",
      url: res.url
    });
  };

  xhr.send(formData);
}

// SIDEBAR
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}

// DM SYSTEM (BASIC POPUP)
function openDM(user) {
  const msg = prompt("Send message to " + user);

  if (!msg) return;

  socket.emit("dm", {
    to: user,
    from: username,
    text: msg
  });
}

// RECEIVE DM
socket.on("dm", (data) => {
  alert(`DM from ${data.from}: ${data.text}`);
});
