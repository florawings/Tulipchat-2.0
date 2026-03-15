const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ==== FOLDERS ==== */

const uploadPath = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ==== STATIC ==== */

app.use(express.static("public"));
app.use("/uploads", express.static(uploadPath));

/* ==== FILE STORAGE ==== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ==== UPLOAD API ==== */

app.post("/upload", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    url: "/uploads/" + req.file.filename
  });

});

/* ==== USERS ==== */

let users = [];

/* ==== SOCKET ==== */

io.on("connection", (socket) => {

  socket.on("join", (data) => {

    socket.username = data.username;
    socket.gender = data.gender;

    users.push({
      id: socket.id,
      username: data.username,
      gender: data.gender
    });

    io.emit("onlineUsers", users);

  });

  socket.on("message", (data) => {

    io.emit("message", data);

  });

  socket.on("disconnect", () => {

    users = users.filter(u => u.id !== socket.id);

    io.emit("onlineUsers", users);

  });

});

/* ==== PORT ==== */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
