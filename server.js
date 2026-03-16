const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

/* ---------- MEMORY USERS ---------- */

let users = [
 { username: "Lord_lucifer", password: "766521", role: "owner" }
];

/* ---------- REGISTER ---------- */

app.post("/register", (req, res) => {

 const { username, password, email, age, gender } = req.body;

 if (!username || !password) {
  return res.json({ error: "Missing fields" });
 }

 const exist = users.find(u => u.username === username);

 if (exist) {
  return res.json({ error: "User already exists" });
 }

 users.push({
  username,
  password,
  email,
  age,
  gender,
  role: "user"
 });

 res.json({ success: true });

});

/* ---------- LOGIN ---------- */

app.post("/login", (req, res) => {

 const { username, password } = req.body;

 const user = users.find(
  u => u.username === username && u.password === password
 );

 if (!user) {
  return res.json({ error: "Invalid login" });
 }

 res.json({ success: true, role: user.role });

});

/* ---------- SOCKET CHAT ---------- */

let onlineUsers = [];

io.on("connection", (socket) => {

 socket.on("join", (username) => {

  socket.username = username;

  if (!onlineUsers.includes(username)) {
   onlineUsers.push(username);
  }

  io.emit("onlineUsers", onlineUsers);

 });

 socket.on("chat", (msg) => {
  io.emit("chat", msg);
 });

 socket.on("disconnect", () => {

  onlineUsers = onlineUsers.filter(
   u => u !== socket.username
  );

  io.emit("onlineUsers", onlineUsers);

 });

});

/* ---------- SERVER START ---------- */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
 console.log("Server running on port " + PORT);
});
