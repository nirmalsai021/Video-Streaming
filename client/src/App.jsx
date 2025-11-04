import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SERVER_URL || 'https://video-streaming-production-dbae.up.railway.app', {
  transports: ['websocket', 'polling']
});

console.log('Connecting to server:', import.meta.env.VITE_SERVER_URL || 'https://video-streaming-production-dbae.up.railway.app');

function App() {
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let peerConnection = null;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('broadcaster', () => {
      console.log('Broadcaster detected');
      setIsStreaming(true);
    });

    socket.on('broadcaster-disconnected', () => {
      console.log('Broadcaster disconnected');
      setIsStreaming(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on('viewer-count', (count) => {
      setViewerCount(count);
    });

    // Broadcaster receives watcher and creates offer
    socket.on('watcher', (id) => {
      if (isBroadcaster && streamRef.current) {
        peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('candidate', id, event.candidate);
          }
        };
        
        streamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, streamRef.current);
        });
        
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => socket.emit('offer', id, peerConnection.localDescription));
      }
    });

    // Viewer receives offer and creates answer
    socket.on('offer', (id, offer) => {
      if (!isBroadcaster) {
        peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('candidate', id, event.candidate);
          }
        };
        
        peerConnection.setRemoteDescription(offer)
          .then(() => peerConnection.createAnswer())
          .then(answer => peerConnection.setLocalDescription(answer))
          .then(() => socket.emit('answer', id, peerConnection.localDescription));
      }
    });

    socket.on('answer', (id, answer) => {
      if (peerConnection) {
        peerConnection.setRemoteDescription(answer);
      }
    });

    socket.on('candidate', (id, candidate) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off('broadcaster');
      socket.off('broadcaster-disconnected');
      socket.off('viewer-count');
      socket.off('watcher');
      socket.off('offer');
      socket.off('answer');
      socket.off('candidate');
      if (peerConnection) peerConnection.close();
    };
  }, [isBroadcaster]);

  // Handle video element setup when broadcaster state changes
  useEffect(() => {
    if (isBroadcaster && streamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
      localVideoRef.current.muted = true;
    }
  }, [isBroadcaster]);

  const startBroadcast = async () => {
    try {
      console.log('Starting broadcast...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      streamRef.current = stream;
      setIsBroadcaster(true);
      setIsStreaming(true);
      console.log('Emitting broadcaster event');
      socket.emit('broadcaster');
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access to start broadcasting');
    }
  };

  const stopBroadcast = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsBroadcaster(false);
    setIsStreaming(false);
    socket.emit('stop-broadcast');
  };

  const joinAsViewer = () => {
    console.log('Joining as viewer...');
    setIsBroadcaster(false);
    socket.emit('watcher');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Live Video Streaming</h1>
      
      <div style={{ marginBottom: '20px' }}>
        {!isBroadcaster ? (
          <div>
            <button 
              onClick={startBroadcast}
              style={{ 
                padding: '10px 20px', 
                marginRight: '10px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Start Broadcasting
            </button>
            <button 
              onClick={joinAsViewer}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#4444ff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Join as Viewer
            </button>
          </div>
        ) : (
          <button 
            onClick={stopBroadcast}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Stop Broadcasting
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {isBroadcaster && (
          <div>
            <h3>Your Stream (Broadcasting)</h3>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '640px', 
                height: '480px', 
                backgroundColor: '#000',
                border: '2px solid #4CAF50'
              }}
            />
          </div>
        )}
        
        {!isBroadcaster && (
          <div>
            <h3>Live Stream {isStreaming ? '(Live)' : '(Waiting for broadcaster...)'}</h3>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ 
                width: '640px', 
                height: '480px', 
                backgroundColor: '#000',
                border: isStreaming ? '2px solid #4CAF50' : '2px solid #ccc'
              }}
            />
            {!isStreaming && (
              <div style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                height: '480px',
                backgroundColor: '#333'
              }}>
                Waiting for broadcaster...
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Status: {isBroadcaster ? 'Broadcasting' : 'Viewing'}</p>
        <p>Connection: {socket.connected ? 'Connected' : 'Disconnected'}</p>
        {isBroadcaster && <p>Viewers: {viewerCount}</p>}
      </div>
    </div>
  );
}

export default App;