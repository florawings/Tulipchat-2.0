const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* MongoDB */

const uri =
"mongodb+srv://USERNAME:PASSWORD@cluster0.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

let db;
let users;
let messages;
let friends;

async function connectDB() {

await client.connect();

db = client.db("tulipchat");

users = db.collection("users");
messages = db.collection("messages");
friends = db.collection("friends");

/* auto delete messages after 2 hours */

await messages.createIndex(
{ createdAt: 1 },
{ expireAfterSeconds: 7200 }
);

console.log("MongoDB connected");

}

connectDB();

/* SOCKET USERS */

let onlineUsers = {};

/* SOCKET CONNECTION */

io.on("connection", (socket) => {

console.log("User connected");

/* JOIN ROOM */

socket.on("joinRoom", async (data) => {

const { username, room } = data;

socket.join(room);

onlineUsers[socket.id] = { username, room };

io.to(room).emit("system", username + " joined the room");

/* send last messages */

const last = await messages
.find({ room })
.sort({ createdAt: -1 })
.limit(20)
.toArray();

socket.emit("oldMessages", last.reverse());

});

/* CHAT MESSAGE */

socket.on("chatMessage", async (data) => {

const msg = {
username: data.username,
room: data.room,
message: data.message,
createdAt: new Date()
};

await messages.insertOne(msg);

io.to(data.room).emit("message", msg);

});

/* FRIEND REQUEST */

socket.on("addFriend", async (data) => {

await friends.insertOne({
from: data.from,
to: data.to
});

socket.emit("system", "Friend request sent");

});

/* OWNER ACTIONS */

socket.on("kickUser", (user) => {

io.emit("system", user + " was kicked by owner");

});

socket.on("banUser", (user) => {

io.emit("system", user + " was banned by owner");

});

socket.on("muteUser", (user) => {

io.emit("system", user + " was muted by owner");

});

/* DISCONNECT */

socket.on("disconnect", () => {

const user = onlineUsers[socket.id];

if (user) {

io.to(user.room).emit(
"system",
user.username + " left the room"
);

delete onlineUsers[socket.id];

}

});

});

/* START SERVER */

server.listen(PORT, () => {

console.log("Server running on port " + PORT);

});
