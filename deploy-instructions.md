# Deployment Instructions

## Server (Railway)
1. Create GitHub repo for server folder
2. Push server code to GitHub
3. Connect Railway to GitHub repo
4. Railway will auto-deploy on port from `process.env.PORT`

## Client (Vercel)
1. Update `.env.production` with your Railway server URL
2. Create GitHub repo for client folder  
3. Connect Vercel to GitHub repo
4. Set environment variable: `VITE_SERVER_URL=https://your-server.railway.app`

## Alternative: One-Click Deploy

### Server (Render)
```bash
cd server
npm install
npm start
```

### Client (Netlify)
```bash
cd client
npm install
npm run build
# Upload dist folder to Netlify
```

## Final URLs
- Server: `https://your-server.railway.app`
- Client: `https://your-app.vercel.app`

## Test Deployment
1. Open client URL in browser
2. Click "Start Broadcasting" (allow camera access)
3. Open client URL in another device/browser
4. Click "Join as Viewer"
5. Video should stream successfully!