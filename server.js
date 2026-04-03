const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ===== DATA =====
let users = [];
let messages = [];

// ===== AUTO DELETE (10 HOURS) =====
setInterval(() => {
  const now = Date.now();
  messages = messages.filter(m => now - m.time < 10 * 60 * 60 * 1000);
}, 60000);

// ===== STATIC FILES (IMPORTANT FIX) =====
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== ROOT ROUTE FIX =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// ===== FILE UPLOAD =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    url: "/uploads/" + req.file.filename
  });
});

// ===== SOCKET =====
io.on("connection", (socket) => {

  console.log("User connected");

  // JOIN
  socket.on("join", (username) => {
    socket.username = username;

    if (!users.includes(username)) {
      users.push(username);
    }

    io.emit("users", users);

    // OLD MESSAGES
    socket.emit("loadMessages", messages);
  });

  // MESSAGE
  socket.on("message", (data) => {
    const msg = {
      user: data.user,
      text: data.text || "",
      type: data.type || "text",
      url: data.url || "",
      time: Date.now()
    };

    messages.push(msg);
    io.emit("message", msg);
  });

  // DM
  socket.on("dm", (data) => {
    io.emit("dm", data); // basic version
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    users = users.filter(u => u !== socket.username);
    io.emit("users", users);
  });

});

// ===== START =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
