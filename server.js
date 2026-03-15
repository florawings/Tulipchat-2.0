const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// =============================
// MongoDB Connection
// =============================

const MONGO_URI =
"mongodb+srv://epfportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mrighsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
})
.catch(err => {
    console.log("MongoDB error:", err);
});

// =============================
// Message Schema
// =============================

const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    image: String,
    type: String,   // public / dm
    to: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model("Message", messageSchema);

// =============================
// Serve Frontend
// =============================

app.use(express.static(path.join(__dirname, "public")));

// =============================
// Online Users
// =============================

let onlineUsers = {};


// =============================
// Socket.IO Logic
// =============================

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // =============================
    // User Join
    // =============================

    socket.on("join", async (username) => {

        socket.username = username;
        onlineUsers[socket.id] = username;

        console.log(username + " joined");

        // online users list send
        io.emit("onlineUsers", Object.values(onlineUsers));

        // chat history load
        const messages = await Message.find().sort({ createdAt: 1 }).limit(200);

        socket.emit("chatHistory", messages);

        // join message
        io.emit("message", {
            username: "System",
            message: username + " joined the chat",
            type: "system"
        });

    });


    // =============================
    // Send Message
    // =============================

    socket.on("sendMessage", async (data) => {

        const msg = new Message({
            username: data.username,
            message: data.message || "",
            image: data.image || "",
            type: data.type || "public",
            to: data.to || ""
        });

        await msg.save();

        // DM logic
        if (data.type === "dm") {

            for (let id in onlineUsers) {

                if (
                    onlineUsers[id] === data.to ||
                    onlineUsers[id] === data.username
                ) {
                    io.to(id).emit("message", msg);
                }

            }

        }
        else {

            // public message
            io.emit("message", msg);

        }

    });


    // =============================
    // User Disconnect
    // =============================

    socket.on("disconnect", () => {

        const username = onlineUsers[socket.id];

        delete onlineUsers[socket.id];

        io.emit("onlineUsers", Object.values(onlineUsers));

        if (username) {

            io.emit("message", {
                username: "System",
                message: username + " left the chat",
                type: "system"
            });

        }

        console.log("User disconnected");

    });

});


// =============================
// Start Server
// =============================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
