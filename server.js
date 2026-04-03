const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

/* 🔥 FILE UPLOAD */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ url: "/uploads/" + req.file.filename });
});

/* 🔥 DATA */
let users = {};
let messages = []; // auto clear after 10 hours

setInterval(() => {
  const now = Date.now();
  messages = messages.filter(m => now - m.time < 10 * 60 * 60 * 1000);
}, 60000);

/* 🔥 SOCKET */
io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("users", Object.values(users));
    socket.emit("oldMessages", messages);
  });

  socket.on("msg", (data) => {
    data.time = Date.now();
    messages.push(data);
    io.emit("msg", data);
  });

  /* 🔥 DM */
  socket.on("dm", ({to, msg}) => {
    for (let id in users) {
      if (users[id] === to) {
        io.to(id).emit("dm", msg);
      }
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", Object.values(users));
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running"));
