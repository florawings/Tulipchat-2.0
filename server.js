const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const authRoutes = require('./routes/auth'); // Router connection

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connecting Modules
app.use('/auth', authRoutes);

// Socket Connection
require('./sockets/chatSocket')(io);

server.listen(3000, () => {
    console.log("Tulip Hot Engine: Running on Port 3000");
});
