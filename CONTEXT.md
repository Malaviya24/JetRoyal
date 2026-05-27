i# Aviator — Full Project Context

## Overview
A real-time multiplayer crash betting game (Aviator-style) with Unity WebGL plane animation. Players bet before each round, watch a multiplier climb, and must cash out before the plane "flies away" (crashes). Built with React frontend + Node.js backend + Socket.IO for real-time communication + SQLite (sql.js) for persistent storage.

**Live URL:** https://game.idkwhoami.in  
**GitHub:** https://github.com/Malaviya24/JetRoyal  
**Admin Panel:** `/jr-control-panel-7k9x2` (obscure path, requires username + password — set via `ADMIN_USERNAME` + `ADMIN_KEY` in `server/.env`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, SCSS, Socket.IO Client, react-unity-webgl v8 |
| Backend | Node.js, Express, Socket.IO, JWT (jsonwebtoken), bcryptjs, multer |
| Database | SQLite via sql.js (pure JS, no native modules needed) |
| Game Animation | Unity WebGL (pre-built, files in public/unity/) |
| Build Tool | react-app-rewired (CRA with webpack overrides) |
| Deployment | VPS (Ubuntu), Nginx reverse proxy, PM2 process manager |

---

## Project Structure

```
aviator-crash/
├── public/
│   ├── unity/              # Unity WebGL build (AirCrash.loader.js, .wasm, .data)
│   ├── sounds/             # Game sounds (Background Music.mp3, Plane start sound.mp3, Plane Crash Sound.mp3, ka-ching.mp3)
│   ├── avatars/            # User avatar images (av-3.png through av-45.png)
│   ├── aviator-logo.png    # 512px brand logo (used as favicon, install icon, auth pages)
│   └── index.html          # Entry HTML with Unity error suppression script
├── src/
│   ├── index.tsx           # App entry — routing logic (game stays mounted, auth pages separate)
│   ├── app.tsx             # Main game layout (Header + BetsUsers + Main)
│   ├── config.ts           # API URL config (uses env var or falls back to "/api")
│   ├── context.tsx         # React context + Socket.IO connection + game state management
│   ├── components/
│   │   ├── header.tsx      # Top bar (logo, balance, sidebar menu, how-to-play modal)
│   │   ├── crash/index.tsx # Unity WebGL renderer + multiplier display + sound triggers
│   │   ├── Main/           # Bet panels (bet.tsx), history display
│   │   └── bet-users/      # All Bets, My Bets, Top tabs (leaderboard with fake bots)
│   ├── pages/
│   │   ├── Login.tsx       # Login page
│   │   ├── Register.tsx    # Register page (username, name, phone, password)
│   │   ├── Deposit.tsx     # Deposit page (QR, UPI, UTR input) — modern Aviator theme
│   │   ├── Withdraw.tsx    # Withdrawal page
│   │   ├── Account.tsx     # Account menu
│   │   ├── ChangePassword.tsx
│   │   ├── BankDetails.tsx # Bank details form for withdrawals
│   │   ├── BetHistory.tsx  # User's full bet history with stats
│   │   ├── Admin.tsx       # Full admin panel (Laravel-style, SVG icons)
│   │   ├── admin.scss      # Admin panel styles
│   │   ├── deposit.scss    # Deposit page styles
│   │   ├── auth.scss       # Shared auth page styles
│   │   └── bethistory.scss
│   ├── utils/
│   │   └── SoundManager.ts # Audio manager (background, takeoff, crash, cashout sounds)
│   └── assets/images/      # Logo SVGs, game rule images
├── server/
│   ├── index.js            # Express + Socket.IO server (ALL backend logic in one file)
│   ├── db.js              # SQLite database layer (sql.js wrapper)
│   ├── package.json       # Backend dependencies
│   ├── aviator.sqlite     # SQLite database file (auto-created, gitignored)
│   └── uploads/           # QR images uploaded by admin (gitignored)
├── .env                   # REACT_APP_API_URL=http://localhost:5000 (local dev only)
├── .gitignore
├── package.json           # Frontend dependencies + scripts
├── config-overrides.js    # Webpack polyfills (crypto, stream, etc.)
└── tailwind.config.js
```

---

## Key Architecture Decisions

### Routing (src/index.tsx)
- Game (Provider + App + Unity) is mounted on ALL routes EXCEPT /login, /register, /admin
- Overlay pages (deposit, withdraw, account, etc.) render as fixed overlays ON TOP of the game
- This prevents Unity from unmounting/crashing when navigating
- Auth pages (/login, /register) are completely separate — no Unity loaded
- Navigation between game ↔ auth uses `window.location.href` (full page reload) to kill Unity cleanly

### Socket.IO Events
**Client → Server:**
- `enterRoom` { token } — join game, authenticate
- `playBet` { betAmount, target, type: "f"|"s", auto } — place bet
- `cashOut` { type, endTarget } — cash out
- `topUp` — add ₹5000 (dev/demo only)

**Server → Client:**
- `gameState` { currentNum, GameState: "BET"|"PLAYING"|"GAMEEND", time }
- `bettedUserInfo` [array of all bets this round]
- `myBetState` { f, s, balance... } — after bet/cashout
- `myInfo` { balance, userName... } — balance updates
- `finishGame` { f, s, balance... } — round end results
- `history` [last 20 crash points]
- `previousHand` [previous round bets]
- `getBetLimits` { max, min }
- `error` { message, index }
- `success` string

### Game Loop (server/index.js)
1. **BET phase** (5 seconds) — players place bets, 50 bots generated
2. **PLAYING phase** — multiplier climbs using formula: `m = 1 + 0.06t + (0.06t)² - (0.04t)³ + (0.04t)⁴`
3. **GAMEEND** — crash point reached, losers lose, winners already cashed out
4. 3-second pause, then back to BET

### Crash Point Control
- Admin can queue multiple crash points via admin panel
- Queue is FIFO — each round uses next value
- When queue is empty, random crash points generated (house edge ~4%)
- Formula: `if (e < 0.04) return 1.0; else return Math.floor((100 / (e * 100)) * 100) / 100`

### Bot System
- 200 unique bot names (Indian names + casino nicknames)
- 50 random bots per round
- Bots have weighted bet amounts (20-12000) and targets (1.1x-20x)
- Bot cashout timing uses binary search on inverse multiplier formula for EXACT timing
- Bots only cash out if their target < crash point (otherwise they lose)

---

## Database Schema (SQLite via sql.js)

```sql
users (id, username, name, phone, password, balance, img, created_at)
transactions (id, user_id, type, amount, status, utr_number, created_at)
bank_details (id, user_id, account_holder, account_number, ifsc_code, bank_name, upi_id)
game_history (id, user_id, username, bet_amount, cashout_at, cashouted, profit, created_at)
crash_history (id, crash_point, created_at)
settings (id, upi_id, qr_image_url)
```

---

## Authentication
- JWT tokens (7-day expiry), stored in localStorage
- Password hashed with bcryptjs (10 rounds)
- Token sent via `Authorization: Bearer <token>` header for API calls
- Token sent via socket `enterRoom` event for game connection

---

## Admin Panel Features (/admin)
- **Dashboard** — total users, deposits, withdrawals stats
- **Live Bets** — real-time view of current round (game state, crash point, real players, bots)
- **Set Crash Point** — queue system (add multiple, clear, remove individual)
- **Game Results** — all crash history from DB
- **All Users** — view, add money, remove money, view details, delete
- **Deposit Requests** — approve/reject (balance added on approve)
- **Withdrawal Requests** — approve/reject (balance refunded on reject)
- **All Bets History** — every bet ever placed
- **Settings** — UPI ID + QR image upload (file upload via multer)
- **User Details** — full user profile, bank details, bet history, transactions

---

## Deployment (VPS)

**Nginx config** at `/etc/nginx/sites-available/jetroyal`:
- `/` → serves `build/` folder (React production build)
- `/api` → proxy to `http://127.0.0.1:5000`
- `/socket.io` → proxy with WebSocket upgrade to `http://127.0.0.1:5000`

**PM2:** `pm2 start index.js --name jetroyal-backend` (in /var/www/JetRoyal/server/)

**Build:** `npm run build` in root (creates build/ folder)

**Config for production (src/config.ts):**
```ts
api: "/api"    // relative — nginx proxies to backend
wss: ""        // empty — same origin
```

---

## Sound System (src/utils/SoundManager.ts)
- `Background Music.mp3` — loops at 70% volume, starts on first user click
- `Plane start sound.mp3` — plays when PLAYING phase starts
- `Plane Crash Sound.mp3` — plays when plane crashes
- `ka-ching.mp3` — plays on successful cashout (new Audio instance each time)

---

## Known Quirks / Important Notes

1. **Unity onwheel error** — Unity WebGL throws "Cannot read properties of null (reading 'onwheel')" when canvas is removed. Suppressed via `window.alert` override in index.html. Navigation to /login uses full page reload to kill Unity.

2. **Cashout button fix** — Server sets `player[type].betted = false` immediately on cashout. Frontend uses functional state update in `myBetState` handler to ensure React re-renders.

3. **Auto cashout** — Only triggers during PLAYING phase when `currentTarget >= cashOut` (not during BET phase). Uses the `betted` and `autoCashoutState` from the specific slot (f or s).

4. **Deposit flow** — User submits deposit → status "pending" → admin approves in admin panel → balance added + live socket updated.

5. **QR upload** — Admin uploads image via multer → saved to server/uploads/ → served at /api/uploads/filename → stored in settings table as relative path.

6. **Bot cashout timing** — Uses binary search on inverse multiplier formula for exact timing. Verifies current multiplier >= target before marking as cashed out.

7. **Crash history persists** — Saved to `crash_history` table on every game end. Loaded on server start (last 50 for live display).

---

## Environment Variables

### Frontend (`.env`)
- `REACT_APP_API_URL` — Backend URL (only needed for local dev: `http://localhost:5000`). In production with Nginx proxy, leave empty or don't set.

### Backend (`server/.env`) — see `server/.env.example`
- `NODE_ENV` — `production` on the VPS, otherwise `development`.
- `PORT` — defaults to 5000.
- `JWT_SECRET` — long random string. **Required in production.**
- `ADMIN_USERNAME` — admin login username (default `admin`).
- `ADMIN_KEY` — admin login password. **Required in production.**
- `ALLOWED_ORIGINS` — comma-separated list of CORS origins, e.g. `https://game.idkwhoami.in`.

### Production Hardening (already in place)
- `helmet` for HTTP security headers
- `express-rate-limit` on auth + admin + write endpoints
- CORS locked to `ALLOWED_ORIGINS` in production
- Admin requires both `x-admin-user` and `x-admin-key` headers
- Admin URL is obscured (`/jr-control-panel-7k9x2`)

---

## Common Commands

**Local development:**
```bash
# Terminal 1 — Backend
cd server && node index.js

# Terminal 2 — Frontend
npm start  # runs on port 4000
```

**Production deploy:**
```bash
cd /var/www/JetRoyal
git pull
cd server && npm install && pm2 restart jetroyal-backend
cd .. && npm install --legacy-peer-deps && npm run build
sudo systemctl reload nginx
```

**Database backup:**
```bash
cp /var/www/JetRoyal/server/aviator.sqlite ~/backup-$(date +%Y%m%d).sqlite
```
