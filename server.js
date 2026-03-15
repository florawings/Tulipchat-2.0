const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let db;
let users = {};

const client = new MongoClient(
"mongodb+srv://epfportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mrighsb.mongodb.net/?retryWrites=true&w=majority"
);

async function startDB(){
try{
await client.connect();
db = client.db("tulipchat");
console.log("MongoDB connected");
}catch(e){
console.log("MongoDB error:",e);
}
}

startDB();

if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads");
}

app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads/");
},
filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname));
}
});

const upload = multer({storage});

app.post("/upload",upload.single("file"),(req,res)=>{
res.json({url:"/uploads/"+req.file.filename});
});

app.get("/messages",async(req,res)=>{
if(!db){
return res.json([]);
}
const msgs = await db.collection("messages").find().toArray();
res.json(msgs);
});

io.on("connection",(socket)=>{

socket.on("join",(name)=>{
users[socket.id]=name;
io.emit("users",Object.values(users));
});

socket.on("message",async(data)=>{
if(db){
await db.collection("messages").insertOne(data);
}
io.emit("message",data);
});

socket.on("image",async(data)=>{
if(db){
await db.collection("messages").insertOne(data);
}
io.emit("image",data);
});

socket.on("disconnect",()=>{
delete users[socket.id];
io.emit("users",Object.values(users));
});

});

server.listen(PORT,()=>{
console.log("Server running on",PORT);
});
