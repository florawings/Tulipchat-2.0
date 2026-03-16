const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

/* static files */
app.use(express.static(path.join(__dirname, "public")));

/* ROUTES IMPORT */
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const friendsRoutes = require("./routes/friends");
const reportRoutes = require("./routes/report");
const shopRoutes = require("./routes/shop");

/* ROUTES USE */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/shop", shopRoutes);

/* HOME PAGE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* LOGIN PAGE */
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* REGISTER PAGE */
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/register.html"));
});

/* CHAT PAGE */
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public/chat.html"));
});

/* SOCKETS */
require("./sockets/chatSocket")(io);
require("./sockets/dmSocket")(io);

/* START SERVER */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
