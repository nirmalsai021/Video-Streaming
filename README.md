# Video Streaming App with Socket Programming

A real-time video streaming application using React, Node.js, Express, and Socket.IO.

## Features
- Live video broadcasting from webcam
- Real-time streaming to multiple viewers
- Socket-based communication
- Simple and clean UI

## Setup Instructions

### Server Setup
1. Navigate to server directory:
```bash
cd server
npm install
npm start
```
Server runs on http://localhost:4000

### Client Setup
1. Navigate to client directory:
```bash
cd client
npm install
npm start
```
Client runs on http://localhost:3000

## How to Use
1. Open http://localhost:3000 in your browser
2. Click "Start Broadcasting" to begin streaming (allow camera/mic access)
3. Open another browser tab/window and click "Join as Viewer" to watch the stream
4. Multiple viewers can join simultaneously

## Architecture
- **Backend**: Node.js + Express + Socket.IO for real-time communication
- **Frontend**: React for UI, MediaRecorder API for video capture
- **Streaming**: Video chunks sent via WebSocket every 100ms

## Socket Events
- `broadcaster`: Identifies user as broadcaster
- `watcher`: Identifies user as viewer
- `video-chunk`: Transmits video data
- `broadcaster-disconnected`: Notifies when broadcaster leaves

## Production Notes
- Add authentication and user management
- Implement HTTPS for secure connections
- Add error handling and reconnection logic
- Consider using WebRTC for lower latency
- Add recording functionality
- Implement chat features