const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ===== MongoDB =====
mongoose.connect(
"mongodb+srv://effportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mrighsb.mongodb.net/tulipchat?retryWrites=true&w=majority"
)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("MongoDB Error:",err));

// ===== Message Schema =====
const Message = mongoose.model("Message",{
user:String,
text:String,
type:String,
time:Date
});

let users = {};

// ===== Socket =====
io.on("connection",(socket)=>{

console.log("user connected");

// join
socket.on("join", async (username)=>{

users[socket.id]=username;

io.emit("onlineUsers",Object.values(users));

io.emit("message",{
user:"System",
text:username+" joined chat",
type:"system"
});

let old = await Message.find().sort({time:1}).limit(50);
socket.emit("oldMessages",old);

});

// send message
socket.on("message",async(data)=>{

let msg = new Message({
user:data.user,
text:data.text,
type:data.type || "text",
time:new Date()
});

await msg.save();

io.emit("message",msg);

});

// disconnect
socket.on("disconnect",()=>{

let name = users[socket.id];

delete users[socket.id];

io.emit("onlineUsers",Object.values(users));

if(name){
io.emit("message",{
user:"System",
text:name+" left chat",
type:"system"
});
}

});

});

server.listen(PORT,()=>{
console.log("Server running on "+PORT);
});
