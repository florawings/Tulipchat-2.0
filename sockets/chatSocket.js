socket.on('sendMessage', (data) => {
    if(data.type === 'gift') {
        io.emit('newMessage', {
            user: data.user,
            text: data.text,
            type: 'gift-animation', // Frontend par special animation dikhayega
            role: socket.role
        });
    }
});
