const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('public'));

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({ status: 'Video Streaming Server is running!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

let broadcaster = null;
let viewers = new Set();

function updateViewerCount() {
  io.emit('viewer-count', viewers.size);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('broadcaster', () => {
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
    console.log('Broadcaster connected:', socket.id);
    updateViewerCount();
  });

  socket.on('watcher', () => {
    viewers.add(socket.id);
    console.log('Watcher connected:', socket.id);
    updateViewerCount();
    
    // Notify viewer if broadcaster is active
    if (broadcaster) {
      socket.emit('broadcaster');
      socket.to(broadcaster).emit('watcher', socket.id);
    }
  });

  socket.on('offer', (id, message) => {
    socket.to(id).emit('offer', socket.id, message);
  });

  socket.on('answer', (id, message) => {
    socket.to(id).emit('answer', socket.id, message);
  });

  socket.on('candidate', (id, message) => {
    socket.to(id).emit('candidate', socket.id, message);
  });

  socket.on('stop-broadcast', () => {
    if (socket.id === broadcaster) {
      broadcaster = null;
      socket.broadcast.emit('broadcaster-disconnected');
      console.log('Broadcast stopped');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.id === broadcaster) {
      broadcaster = null;
      socket.broadcast.emit('broadcaster-disconnected');
      console.log('Broadcaster disconnected');
    }
    
    viewers.delete(socket.id);
    updateViewerCount();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Video Streaming Server running on port ${PORT}`);
  console.log(`📺 Local: http://localhost:${PORT}`);
  console.log(`📺 Network: http://10.192.77.188:${PORT}`);
  console.log(`⚡ Server ready for connections...\n`);
});