const { getAIResponse } = require('../utils/devilAI');

module.exports = (io) => {
    io.on('connection', (socket) => {
        
        socket.on('sendMessage', (data) => {
            const userMsg = data.text.toLowerCase();

            // 1. Pehle normal message sabko bhej do
            io.emit('newMessage', {
                user: socket.username,
                text: data.text,
                role: socket.role,
                type: 'text'
            });

            // 2. AI Bot Trigger Check
            if (userMsg.includes('hey devil') || userMsg.includes('devil')) {
                // Halka sa delay taaki real lage (2 seconds)
                setTimeout(() => {
                    const aiMsg = getAIResponse(userMsg);
                    io.emit('newMessage', {
                        user: 'DEVIL AI 😈',
                        text: aiMsg,
                        role: 'bot', // Bot ka alag role
                        type: 'ai-response'
                    });
                }, 1500);
            }
        });
    });
};
