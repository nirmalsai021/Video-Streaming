# Deployment Guide

## Quick Deploy Options:

### 1. Heroku (Free/Easy)
```bash
# Install Heroku CLI, then:
heroku create your-video-app
git add .
git commit -m "Deploy video streaming app"
git push heroku main
```

### 2. Railway (Free/Easy)
```bash
# Connect GitHub repo to Railway
# Auto-deploys on push
```

### 3. Render (Free)
```bash
# Connect GitHub repo to Render
# Auto-deploys on push
```

### 4. Local Network (Same WiFi)
```bash
# Find your IP address
ipconfig

# Start server with your IP
# Update .env file:
REACT_APP_SERVER_URL=http://YOUR_IP:4000

# Access from other devices:
http://YOUR_IP:3000
```

## Environment Variables:
- **Server**: `CLIENT_URL` (optional)
- **Client**: `REACT_APP_SERVER_URL`

## Usage After Deploy:
1. **Device 1**: Go to deployed URL → "Start Broadcasting"
2. **Device 2**: Go to same URL → "Join as Viewer"
3. **Multiple devices** can join as viewers simultaneously