const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.json());
app.use(express.static("public"));

const users = {}; // { username: password }

// register
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ ok: false, msg: "Missing fields" });
  if (users[username]) return res.json({ ok: false, msg: "User exists" });

  users[username] = password;
  res.json({ ok: true });
});

// login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    return res.json({ ok: true });
  }
  res.json({ ok: false, msg: "Invalid login" });
});

io.on("connection", (socket) => {
  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running on " + PORT));
