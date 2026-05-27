# Aviator - Crash Game ✈️

A real-time multiplayer crash betting game with Unity WebGL animation, built with React + Node.js + Socket.IO + SQLite.

## Features

- Real-time multiplayer crash game with Unity WebGL plane animation
- User registration & login (JWT auth)
- Deposit & withdrawal system with admin approval
- Admin panel with crash control, user management, payment settings
- Sound effects (background music, takeoff, crash, cashout)
- Fake bot players for realistic leaderboard
- Responsive design
- SQLite database (no external DB needed)

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Socket.IO Client, Unity WebGL
- **Backend:** Node.js, Express, Socket.IO, SQLite (sql.js), JWT, bcrypt

## Setup

### Frontend
```bash
npm install --legacy-peer-deps
npm start
```
Runs on http://localhost:4000

### Backend
```bash
cd server
npm install
node index.js
```
Runs on http://localhost:5000

## Deployment (VPS with Nginx)

1. Clone repo on VPS
2. Build frontend: `npm run build`
3. Start backend with PM2: `cd server && pm2 start index.js --name jetroyal`
4. Configure Nginx to serve `build/` folder and proxy `/api` + `/socket.io` to port 5000

## Admin Panel

- URL: `/admin`
- Password: `admin123`
- Features: Set crash point, manage users, approve deposits/withdrawals, configure UPI/QR

## Environment

Create `.env` in root:
```
REACT_APP_API_URL=http://localhost:5000
```

For production, set `REACT_APP_API_URL` to your domain or leave empty if using Nginx proxy.
