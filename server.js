const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ROOT */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* LOGIN PAGE */
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* REGISTER PAGE */
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/register.html"));
});

/* USERS */
let users = [{ username: "Lord_lucifer", password: "766521" }];

/* LOGIN API */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({ success: false });
  }

  res.json({ success: true });
});

/* REGISTER API */
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const exist = users.find(u => u.username === username);

  if (exist) {
    return res.json({ success: false });
  }

  users.push({ username, password });

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
