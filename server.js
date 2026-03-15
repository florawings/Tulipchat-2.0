const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* Upload setup */
const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, "uploads/");
},
filename: function (req, file, cb) {
cb(null, Date.now() + path.extname(file.originalname));
}
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
res.json({ url: "/uploads/" + req.file.filename });
});

/* Users */
let users = {};   // username -> socket id

io.on("connection", (socket) => {

socket.on("join", (data) => {
users[data.username] = socket.id;
socket.join(data.room);

io.to(data.room).emit("system", data.username + " joined " + data.room);
io.emit("online", Object.keys(users));

});

socket.on("message", (data) => {
io.to(data.room).emit("message", data);
});

socket.on("dm", (data) => {
let target = users[data.to];
if (target) {
io.to(target).emit("dm", data);
}
});

socket.on("disconnect", () => {
for (let u in users) {
if (users[u] === socket.id) delete users[u];
}
io.emit("online", Object.keys(users));
});

});

server.listen(3000, () => {
console.log("TulipChat running on 3000");
});
