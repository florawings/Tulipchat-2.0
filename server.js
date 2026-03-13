const onlineUsers = {};

io.on("connection", (socket) => {

socket.on("join", (username)=>{
onlineUsers[socket.id] = username;
io.emit("users", Object.values(onlineUsers));
});

socket.on("chat message",(data)=>{
io.emit("chat message",data);
});

socket.on("typing",(username)=>{
socket.broadcast.emit("typing",username);
});

socket.on("disconnect",()=>{
delete onlineUsers[socket.id];
io.emit("users", Object.values(onlineUsers));
});

});
