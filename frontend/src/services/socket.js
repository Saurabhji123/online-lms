import { io } from 'socket.io-client';

let socket = null;

export const initiateSocketConnection = (courseId) => {
  // Reuse the existing socket connection if already established
  if (!socket) {
    const BACKEND_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : window.location.origin;
    socket = io(BACKEND_URL);
    console.log('Websocket connecting to:', BACKEND_URL);
  }

  if (courseId) {
    socket.emit('joinCourse', courseId);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Websocket disconnected.');
  }
};

export const subscribeToChat = (callback) => {
  if (!socket) return;
  socket.on('message', (msg) => {
    callback(msg);
  });
};

export const sendChatMessage = (courseId, messageText, user) => {
  if (socket) {
    socket.emit('sendMessage', {
      courseId,
      replyText: messageText,
      user: {
        _id: user.id || user._id,
        name: user.name,
        role: user.role,
        photo: user.photo || ''
      },
      createdAt: new Date()
    });
  }
};
