const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

// Parse JSON & URL bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folders for file and certificate hosting
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure upload folders exist
const certDir = path.join(__dirname, 'public/uploads/certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Import Route Files
const auth = require('./routes/auth');
const users = require('./routes/users');
const courses = require('./routes/courses');
const modules = require('./routes/modules');
const lectures = require('./routes/lectures');
const enrollments = require('./routes/enrollments');
const assignments = require('./routes/assignments');
const submissions = require('./routes/submissions');
const quizzes = require('./routes/quizzes');
const results = require('./routes/results');
const attendance = require('./routes/attendance');
const discussions = require('./routes/discussions');
const resources = require('./routes/resources');
const certificates = require('./routes/certificates');
const notifications = require('./routes/notifications');
const liveSessions = require('./routes/liveSessions');
const analytics = require('./routes/analytics');
const messages = require('./routes/messages');

// Mount API Routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/courses', courses);
app.use('/api/modules', modules);
app.use('/api/lectures', lectures);
app.use('/api/enrollments', enrollments);
app.use('/api/assignments', assignments);
app.use('/api/submissions', submissions);
app.use('/api/quizzes', quizzes);
app.use('/api/results', results);
app.use('/api/attendance', attendance);
app.use('/api/discussions', discussions);
app.use('/api/resources', resources);
app.use('/api/certificates', certificates);
app.use('/api/notifications', notifications);
app.use('/api/livesessions', liveSessions);
app.use('/api/analytics', analytics);
app.use('/api/messages', messages);

// Root route
app.get('/', (req, res) => {
  res.send('LMS Backend API Server is running...');
});

// Configure Socket.IO
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`WebSocket client connected: ${socket.id}`);

  // Channel room join
  socket.on('joinCourse', (courseId) => {
    socket.join(courseId);
    console.log(`Socket ${socket.id} joined course channel: ${courseId}`);
  });

  // Discussion message broker
  socket.on('sendMessage', (data) => {
    // Broadcast message to everyone in the course room
    io.to(data.courseId).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`WebSocket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});
