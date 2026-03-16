const socket = io();

// Message receive karne ka logic
socket.on('newMessage', (data) => {
  const chatBox = document.getElementById('messages');
  const div = document.createElement('div');
  
  // Role based tags
  let roleTag = '';
  if (data.role === 'owner') roleTag = '<span class="tag owner">OWNER 👑</span>';
  else if (data.role === 'admin') roleTag = '<span class="tag admin">ADMIN 🛡️</span>';
  else if (data.role === 'mod') roleTag = '<span class="tag mod">MOD</span>';

  div.className = `msg-container ${data.role}`;
  div.innerHTML = `
    <div class="msg-header">
      ${roleTag} <span class="username">${data.user}</span>
      <span class="time">${data.time}</span>
    </div>
    <div class="msg-text">${data.text}</div>
  `;
  
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// System/Error messages handle karna
socket.on('sys_message', (msg) => {
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.innerText = msg;
  document.getElementById('messages').appendChild(div);
});

socket.on('error_msg', (msg) => {
  alert(msg);
});
