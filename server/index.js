const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./db");

// Load .env if present (production)
try { require("dotenv").config(); } catch (e) { /* dotenv optional in dev */ }

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

const app = express();

// ---- security headers ----
app.use(helmet({
  contentSecurityPolicy: false, // game UI loads Unity; CSP handled at nginx level
  crossOriginEmbedderPolicy: false,
}));

// ---- CORS — locked down in production ----
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / no-origin (curl, server-to-server) and whitelist
    if (!origin) return cb(null, true);
    if (!IS_PROD) return cb(null, true); // permissive in dev
    if (ALLOWED_ORIGINS.length === 0) return cb(null, true); // not configured -> permit
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
// Trust nginx proxy so rate-limit / req.ip work behind reverse proxy
app.set("trust proxy", 1);

// ---- rate limits ----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login/register attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});
// Admin panel polls every 3s across multiple endpoints — be generous.
// This is per-minute, and the panel is already protected by username + password.
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests" },
});
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Create uploads directory if not exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Serve uploaded files statically (both /uploads and /api/uploads work)
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/api/uploads", express.static(UPLOADS_DIR));

// Multer config for QR image upload
const qrStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `qr-${Date.now()}${ext}`);
  },
});
const qrUpload = multer({
  storage: qrStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "aviator_crash_secret_key_2024";

if (IS_PROD && JWT_SECRET === "aviator_crash_secret_key_2024") {
  console.warn("[WARN] Running in production with default JWT_SECRET. Set JWT_SECRET in .env!");
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: IS_PROD && ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ============ GAME CONFIG ============
const BET_LIMITS = { max: 100000, min: 1 };
const BET_PHASE_DURATION = 5000;

const BOT_NAMES = [
  // Indian first-name + initial
  "Rahul_K", "Priya_M", "Amit_S", "Sneha_R", "Vikram_P",
  "Anita_D", "Raj_Kumar", "Deepak_V", "Pooja_N", "Suresh_T",
  "Kavita_G", "Manoj_B", "Ritu_S", "Arun_L", "Neha_J",
  "Sanjay_W", "Divya_C", "Rohit_A", "Meena_H", "Kiran_F",
  "Lucky777", "BigBoss99", "CrashPro", "HighRoller", "JetWin",
  "StarPlayer", "GoldMiner", "RocketBet", "AceHigh", "TopGun",
  "Arjun_99", "Simran_D", "Mohit_K", "Anjali_P", "Ravi_S",
  "Nisha_T", "Gaurav_M", "Swati_R", "Vishal_B", "Komal_N",
  "Harsh_J", "Sakshi_L", "Nikhil_R", "Tanvi_G", "Akash_D",
  "Megha_S", "Varun_C", "Isha_M", "Kunal_P", "Shreya_B",
  "Rajesh_V", "Sunita_K", "Manish_T", "Pallavi_A", "Vivek_N",
  "Geeta_H", "Ashish_F", "Rekha_W", "Pankaj_Y", "Jyoti_Z",
  "Yash_R", "Tina_M", "Karan_S", "Aisha_L", "Dev_P",
  "Riya_G", "Aarav_K", "Diya_S", "Ishaan_M", "Tara_B",
  "Krishna_J", "Maya_T", "Aryan_D", "Sara_V", "Vihaan_R",
  "Aditi_C", "Reyansh_K", "Anaya_P", "Atharv_M", "Kiara_S",
  "Vivaan_L", "Myra_T", "Krish_J", "Pari_D", "Shivansh_R",
  "Aanya_K", "Dhruv_M", "Ananya_P", "Veer_S", "Kyra_B",
  "Ayaan_C", "Avni_K", "Reyaan_S", "Saanvi_L", "Aarush_M",
  "Riaan_T", "Anika_J", "Aaryan_D", "Pihu_K", "Shaurya_M",
  // Casino-style nicknames
  "FlyHigh", "SkyKing", "MoonShot", "DiamondHand", "SilverFox",
  "BigShot77", "RedKing", "BlackQueen", "GoldRush21", "PlatinumP",
  "Hawkeye", "Thunder99", "LightningBolt", "SunRider", "MoonWalker",
  "Maverick", "Ranger88", "Falcon7", "Eagle_X", "Tiger_Z",
  "Phoenix1", "DragonFly", "WolfPack", "PantherK", "LionHeart",
  "BetBoss", "WinKing", "ProAce", "ChampionA", "MasterBet",
  "SkyRider", "CloudNine", "StarBurst", "CometX", "NebulaQ",
  "MeteorM", "GalaxyG", "VortexV", "TitanT", "ZeusZ",
  "ApolloA", "AresR", "OdinO", "ThorT", "LokiL",
  "Spartan9", "Viking88", "Samurai7", "NinjaN", "WarriorW",
  "FireFox", "IceWolf", "StormS", "BlazeB", "FrostF",
  "Crimson1", "AzureA", "EmeraldE", "Sapphire2", "RubyR",
  "OnyxO", "JadeJ", "TopazT", "PearlP", "OpalO",
  "ZenithZ", "ApexA", "PinnacleP", "SummitS", "CrestC",
  "FlashF", "BlitzB", "RushR", "SwiftS", "Speedy7",
  "JackpotJ", "WinnerW", "VictorV", "HeroH", "LegendL",
  "MysticM", "OracleO", "ShadowS", "PhantomP", "GhostG",
  "RebelR", "RogueR2", "OutlawO", "BanditB", "PirateP2",
  "AdmiralA", "CaptainC", "MajorM2", "GeneralG2", "ColonelC2",
  "RookR", "KnightK", "BishopB2", "QueenQ", "KingK2",
  "AceOfSpades", "JokerJ", "CardShark", "ChipKing", "RollHigh",
  "LuckyLad", "HappyHigh", "JoyJoy", "BlissB", "MerlinM",
  "WizardW", "Sorcerer", "Mage_M", "Druid_D", "Cleric_C",
  "ArcherA", "HunterH", "SniperS", "ScoutS2", "RangerR2",
  "BravoB", "DeltaD", "EchoE", "FoxtrotF", "GolfG",
  "HotelH", "IndiaI", "JulietJ", "KiloK", "LimaL",
];

const BOT_AVATARS = [
  "/avatars/av-3.png", "/avatars/av-4.png", "/avatars/av-5.png",
  "/avatars/av-12.png", "/avatars/av-13.png", "/avatars/av-14.png",
  "/avatars/av-15.png", "/avatars/av-39.png", "/avatars/av-45.png",
];

// ============ GAME STATE ============
let gameState = "BET";
let crashPoint = 1;
let gameStartTime = Date.now();
let history = [];
let bettedUsers = [];
let previousHand = [];
const players = new Map();

// ============ START SERVER (async for DB init) ============
async function startServer() {
  await db.initDB();
  console.log("[DB] SQLite ready");

  // Load recent crash history from DB
  const savedHistory = db.getRecentCrashHistory(50);
  history = savedHistory.map((row) => row.crashPoint);
  console.log(`[DB] Loaded ${history.length} previous crash results`);

// ============ AUTH MIDDLEWARE ============
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ============ AUTH ROUTES ============
// Generate a short unique referral code for a user (e.g. "JR4F8B").
function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/I/1
  let code = "JR";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const REFERRAL_BONUS_AMOUNT = 100; // ₹ paid to both sides
const REFERRAL_MIN_DEPOSIT = 500;  // referee must deposit at least this much

app.post("/api/register", authLimiter, (req, res) => {
  try {
    const { username, name, phone, password, confirmPassword, referralCode } = req.body;

    if (!username || !name || !phone || !password || !confirmPassword)
      return res.status(400).json({ error: "All fields are required" });
    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match" });
    if (username.length < 3)
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (phone.length < 10)
      return res.status(400).json({ error: "Enter a valid phone number" });

    if (db.findUserByUsername(username))
      return res.status(400).json({ error: "Username already taken" });

    // Validate referral code (if provided)
    let referrer = null;
    if (referralCode && referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();
      referrer = db.findUserByReferralCode(code);
      if (!referrer) {
        return res.status(400).json({ error: "Invalid referral code" });
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const avatarOptions = ["/avatars/av-3.png", "/avatars/av-4.png", "/avatars/av-5.png", "/avatars/av-12.png", "/avatars/av-13.png", "/avatars/av-14.png", "/avatars/av-15.png", "/avatars/av-39.png", "/avatars/av-45.png"];
    const img = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
    const user = db.createUser({ username, name, phone, password: hashedPassword, img });

    // Assign a unique referral code to the new user
    let newCode;
    let attempts = 0;
    do {
      newCode = generateReferralCode();
      attempts++;
    } while (db.findUserByReferralCode(newCode) && attempts < 10);
    db.setReferralCode(user.id, newCode);

    // Link to referrer if provided
    if (referrer) {
      db.setReferredBy(user.id, referrer.id);
    }

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: user.id, username, name, phone, balance: user.balance, img, referralCode: newCode },
    });
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", authLimiter, (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password are required" });

    const user = db.findUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(400).json({ error: "Invalid username or password" });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, name: user.name, phone: user.phone, balance: user.balance, img: user.img },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// ============ USER ROUTES ============
app.get("/api/user/profile", authMiddleware, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ success: true, user: { id: user.id, username: user.username, name: user.name, phone: user.phone, balance: user.balance, img: user.img } });
});

app.post("/api/user/change-password", authMiddleware, (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmNewPassword)
    return res.status(400).json({ error: "All fields are required" });
  if (newPassword !== confirmNewPassword)
    return res.status(400).json({ error: "New passwords do not match" });
  if (newPassword.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const user = db.findUserById(req.user.id);
  if (!bcrypt.compareSync(oldPassword, user.password))
    return res.status(400).json({ error: "Old password is incorrect" });

  db.updatePassword(req.user.id, bcrypt.hashSync(newPassword, 10));
  res.json({ success: true, message: "Password changed successfully" });
});

// ============ BANK DETAILS ============
app.get("/api/user/bank-details", authMiddleware, (req, res) => {
  const bank = db.getBankDetails(req.user.id);
  res.json({ success: true, bank });
});

app.post("/api/user/bank-details", authMiddleware, (req, res) => {
  const { accountHolder, accountNumber, ifscCode, bankName, upiId } = req.body;
  if (!accountHolder || !accountNumber || !ifscCode || !bankName)
    return res.status(400).json({ error: "All bank fields are required" });

  db.saveBankDetails(req.user.id, { accountHolder, accountNumber, ifscCode, bankName, upiId: upiId || "" });
  res.json({ success: true, message: "Bank details saved successfully" });
});

// ============ DEPOSIT / WITHDRAWAL ============
app.post("/api/user/deposit", apiLimiter, authMiddleware, (req, res) => {
  const { amount, utrNumber } = req.body;
  if (!amount || amount < 100)
    return res.status(400).json({ error: "Minimum deposit is ₹100" });
  if (!utrNumber || utrNumber.length < 6)
    return res.status(400).json({ error: "Enter a valid UTR number" });

  db.addTransaction(req.user.id, "deposit", amount, "pending", utrNumber);

  res.json({ success: true, message: "Deposit request submitted! Awaiting admin approval." });
});

app.post("/api/user/withdraw", apiLimiter, authMiddleware, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 100)
    return res.status(400).json({ error: "Minimum withdrawal is ₹100" });

  const user = db.findUserById(req.user.id);
  if (user.balance < amount)
    return res.status(400).json({ error: "Insufficient balance" });
  if (!db.getBankDetails(req.user.id))
    return res.status(400).json({ error: "Please add bank details first" });

  const newBalance = db.deductBalance(req.user.id, amount);
  if (newBalance < 0) return res.status(400).json({ error: "Insufficient balance" });

  db.addTransaction(req.user.id, "withdrawal", amount, "pending");

  for (const [socketId, player] of players) {
    if (player.userId === req.user.id) {
      player.balance = newBalance;
      io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
    }
  }

  res.json({ success: true, message: "Withdrawal request submitted!", balance: newBalance });
});

app.get("/api/user/transactions", authMiddleware, (req, res) => {
  res.json({ success: true, transactions: db.getTransactions(req.user.id) });
});

// ============ REFERRAL ============
app.get("/api/user/referrals", authMiddleware, (req, res) => {
  // Make sure the user has a referral_code (back-fill for older accounts)
  let user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.referral_code) {
    let newCode;
    let attempts = 0;
    do {
      newCode = generateReferralCode();
      attempts++;
    } while (db.findUserByReferralCode(newCode) && attempts < 10);
    db.setReferralCode(user.id, newCode);
    user = db.findUserById(req.user.id);
  }

  const stats = db.getReferralStats(req.user.id);
  const list = db.getReferralsForUser(req.user.id);
  res.json({
    success: true,
    referralCode: stats.referralCode,
    bonusAmount: REFERRAL_BONUS_AMOUNT,
    minDeposit: REFERRAL_MIN_DEPOSIT,
    totalEarnings: stats.totalEarnings,
    totalReferrals: stats.totalReferrals,
    paidReferrals: stats.paidReferrals,
    referrals: list,
  });
});

// Validate a referral code (used by register page to show "Referred by X" hint)
app.get("/api/referral/validate/:code", (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  if (!code) return res.status(400).json({ valid: false });
  const u = db.findUserByReferralCode(code);
  if (!u) return res.json({ valid: false });
  res.json({ valid: true, referrerName: u.username });
});

// ============ GAME HISTORY / LEADERBOARD ============
app.post("/api/my-info", (req, res) => {
  const { name } = req.body;
  const userHistory = db.getGameHistoryByUser(name, 50);
  res.json({ status: true, data: userHistory });
});

app.get("/api/leaderboard", (req, res) => {
  const realTop = db.getTopWinners();
  const fakeEntries = BOT_NAMES.slice(0, 15).map((name) => ({
    name,
    totalWin: Math.floor(Math.random() * 50000) + 5000,
  }));
  const combined = [...realTop, ...fakeEntries].sort((a, b) => b.totalWin - a.totalWin).slice(0, 20);
  res.json({ success: true, leaderboard: combined });
});

// ============ ADMIN ROUTES ============
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_KEY = process.env.ADMIN_KEY || "admin123";

if (IS_PROD && ADMIN_KEY === "admin123") {
  console.warn("[WARN] Running in production with default ADMIN_KEY. Set ADMIN_KEY in .env!");
}

function adminMiddleware(req, res, next) {
  const user = req.headers["x-admin-user"];
  const key = req.headers["x-admin-key"];
  if (user !== ADMIN_USERNAME || key !== ADMIN_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

// Apply rate limit + auth to all /api/admin routes
app.use("/api/admin", adminLimiter);

// Admin: set next crash point - now supports queue
let manualCrashQueue = [];

app.post("/api/admin/set-crash", adminMiddleware, (req, res) => {
  const { crashPoint: cp } = req.body;
  if (!cp || cp < 1.01) return res.status(400).json({ error: "Crash point must be at least 1.01" });
  manualCrashQueue.push(cp);
  console.log(`[ADMIN] Crash queue: ${manualCrashQueue.join(", ")}`);
  res.json({ success: true, message: `Added ${cp}x to crash queue (${manualCrashQueue.length} pending)`, queue: manualCrashQueue });
});

app.get("/api/admin/crash-queue", adminMiddleware, (req, res) => {
  res.json({ success: true, queue: manualCrashQueue });
});

app.delete("/api/admin/crash-queue/:idx", adminMiddleware, (req, res) => {
  const idx = parseInt(req.params.idx);
  if (idx >= 0 && idx < manualCrashQueue.length) {
    manualCrashQueue.splice(idx, 1);
  }
  res.json({ success: true, queue: manualCrashQueue });
});

app.post("/api/admin/clear-crash-queue", adminMiddleware, (req, res) => {
  manualCrashQueue = [];
  res.json({ success: true, message: "Queue cleared" });
});

// Admin: Force crash NOW (immediately end current round)
let forceCrashNow = false;

app.post("/api/admin/crash-now", adminMiddleware, (req, res) => {
  if (gameState !== "PLAYING") {
    return res.status(400).json({ error: "Game is not in PLAYING state" });
  }
  forceCrashNow = true;
  res.json({ success: true, message: "Crash triggered! Plane will crash immediately." });
});

// Live bets — current round
app.get("/api/admin/live-bets", adminMiddleware, (req, res) => {
  const realPlayers = bettedUsers.filter((u) => !u.bot);
  const bots = bettedUsers.filter((u) => u.bot);
  res.json({
    success: true,
    gameState,
    crashPoint,
    queueLength: manualCrashQueue.length,
    nextCrash: manualCrashQueue.length > 0 ? manualCrashQueue[0] : null,
    realPlayers,
    bots,
    totalBets: bettedUsers.length,
  });
});

app.get("/api/admin/results", adminMiddleware, (req, res) => {
  // Load all crash history from DB (not just memory)
  const allHistory = db.getAllCrashHistory();
  const results = allHistory.map((row, i) => ({
    crashPoint: row.crashPoint,
    time: row.time,
    round: allHistory.length - i,
  }));
  res.json({ success: true, results });
});

app.get("/api/admin/users", adminMiddleware, (req, res) => {
  const allUsers = db.getAllUsers ? db.getAllUsers() : [];
  res.json({ success: true, users: allUsers });
});

app.post("/api/admin/add-money", adminMiddleware, (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount || amount <= 0) return res.status(400).json({ error: "Invalid data" });

  const newBalance = db.addBalance(userId, amount);
  if (newBalance === 0) return res.status(400).json({ error: "User not found" });

  // Update live socket
  for (const [socketId, player] of players) {
    if (player.userId === userId) {
      player.balance = newBalance;
      io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
      io.to(socketId).emit("success", `Admin added ₹${amount} to your account!`);
    }
  }

  db.addTransaction(userId, "admin_credit", amount, "approved");
  res.json({ success: true, message: `Added ₹${amount}`, balance: newBalance });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", players: players.size, gameState });
});

// ============ PUBLIC: DEPOSIT INFO ============
app.get("/api/deposit-info", (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, upiId: settings.upiId, qrImageUrl: settings.qrImageUrl });
});

// ============ ADMIN: SETTINGS ============
app.get("/api/admin/settings", adminMiddleware, (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

app.post("/api/admin/settings", adminMiddleware, (req, res) => {
  try {
    const { upiId, qrImageUrl } = req.body || {};
    // Load current settings, then merge — allows saving just upiId or just qrImageUrl
    const current = db.getSettings();
    const merged = {
      upiId: typeof upiId === "string" ? upiId : (current.upiId || ""),
      qrImageUrl: typeof qrImageUrl === "string" ? qrImageUrl : (current.qrImageUrl || ""),
    };
    const settings = db.saveSettings(merged);
    res.json({ success: true, message: "Settings saved", settings });
  } catch (e) {
    console.error("[ADMIN] Save settings error:", e);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// ============ ADMIN: QR IMAGE UPLOAD ============
app.post("/api/admin/upload-qr", (req, res, next) => {
  // Manual admin auth check (multer middleware needs to run first for files)
  const user = req.headers["x-admin-user"];
  const key = req.headers["x-admin-key"];
  if (user !== ADMIN_USERNAME || key !== ADMIN_KEY) return res.status(403).json({ error: "Unauthorized" });
  next();
}, qrUpload.single("qrImage"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Always read fresh settings so we preserve the existing upiId
    const current = db.getSettings() || { upiId: "", qrImageUrl: "" };

    // Delete old QR file if exists
    if (current.qrImageUrl && (current.qrImageUrl.startsWith("/uploads/") || current.qrImageUrl.startsWith("/api/uploads/"))) {
      const filename = path.basename(current.qrImageUrl);
      const oldPath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    const qrImageUrl = `/api/uploads/${req.file.filename}`;
    const saved = db.saveSettings({ upiId: current.upiId || "", qrImageUrl });
    res.json({ success: true, qrImageUrl: saved.qrImageUrl, settings: saved, message: "QR image uploaded" });
  } catch (e) {
    console.error("[ADMIN] QR upload error:", e);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ============ ADMIN: DEPOSIT REQUESTS ============
app.get("/api/admin/deposits", adminMiddleware, (req, res) => {
  const deposits = db.getAllTransactions("deposit");
  // Attach username to each transaction
  const enriched = deposits.map((txn) => {
    const user = db.findUserById(txn.userId);
    return { ...txn, username: user ? user.username : "Unknown" };
  });
  res.json({ success: true, deposits: enriched });
});

app.post("/api/admin/deposit-action", adminMiddleware, (req, res) => {
  const { id, action } = req.body;
  if (!id || !action) return res.status(400).json({ error: "Missing id or action" });

  const txn = db.updateTransactionStatus(id, action === "approve" ? "approved" : "rejected");
  if (!txn) return res.status(404).json({ error: "Transaction not found" });

  if (action === "approve") {
    const newBalance = db.addBalance(txn.userId, txn.amount);
    // Update live socket
    for (const [socketId, player] of players) {
      if (player.userId === txn.userId) {
        player.balance = newBalance;
        io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
        io.to(socketId).emit("success", `Your deposit of ₹${txn.amount} has been approved!`);
      }
    }

    // Referral bonus: pay once when the referred user's first qualifying deposit is approved
    if (txn.amount >= REFERRAL_MIN_DEPOSIT) {
      const paid = db.payReferralBonus(txn.userId, REFERRAL_BONUS_AMOUNT);
      if (paid) {
        // Refresh both balances on live sockets
        const refereeUser = db.findUserById(paid.refereeId);
        const referrerUser = db.findUserById(paid.referrerId);
        for (const [socketId, player] of players) {
          if (player.userId === paid.refereeId && refereeUser) {
            player.balance = refereeUser.balance;
            io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
            io.to(socketId).emit("success", `Welcome bonus credited! +₹${REFERRAL_BONUS_AMOUNT}`);
          }
          if (player.userId === paid.referrerId && referrerUser) {
            player.balance = referrerUser.balance;
            io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
            io.to(socketId).emit("success", `Referral bonus earned! +₹${REFERRAL_BONUS_AMOUNT}`);
          }
        }
        console.log(`[REFERRAL] Paid ₹${REFERRAL_BONUS_AMOUNT} to referrer #${paid.referrerId} and referee #${paid.refereeId}`);
      }
    }
  }

  res.json({ success: true, message: `Deposit ${action === "approve" ? "approved" : "rejected"}` });
});

// ============ ADMIN: WITHDRAWAL REQUESTS ============
app.get("/api/admin/withdrawals", adminMiddleware, (req, res) => {
  const withdrawals = db.getAllTransactions("withdrawal");
  const enriched = withdrawals.map((txn) => {
    const user = db.findUserById(txn.userId);
    return { ...txn, username: user ? user.username : "Unknown" };
  });
  res.json({ success: true, withdrawals: enriched });
});

app.post("/api/admin/withdrawal-action", adminMiddleware, (req, res) => {
  const { id, action } = req.body;
  if (!id || !action) return res.status(400).json({ error: "Missing id or action" });

  const txn = db.updateTransactionStatus(id, action === "approve" ? "approved" : "rejected");
  if (!txn) return res.status(404).json({ error: "Transaction not found" });

  // If rejected, refund the balance
  if (action === "reject") {
    const newBalance = db.addBalance(txn.userId, txn.amount);
    for (const [socketId, player] of players) {
      if (player.userId === txn.userId) {
        player.balance = newBalance;
        io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
        io.to(socketId).emit("success", `Your withdrawal of ₹${txn.amount} was rejected. Amount refunded.`);
      }
    }
  }

  res.json({ success: true, message: `Withdrawal ${action === "approve" ? "approved" : "rejected"}` });
});

// ============ ADMIN: DASHBOARD STATS ============
app.get("/api/admin/stats", adminMiddleware, (req, res) => {
  const stats = db.getStats();
  res.json({ success: true, stats });
});

// ============ ADMIN: USER DETAILS ============
app.get("/api/admin/user-details/:userId", adminMiddleware, (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const bank = db.getBankDetails(userId);
  const bets = db.getGameHistoryByUser(user.username, 0); // all bets
  const transactions = db.getTransactions(userId);

  res.json({
    success: true,
    user: { id: user.id, username: user.username, name: user.name, phone: user.phone, balance: user.balance, img: user.img, createdAt: user.created_at },
    bank: bank || null,
    bets,
    transactions
  });
});

// ============ ADMIN: DELETE USER ============
app.post("/api/admin/delete-user", adminMiddleware, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  // Disconnect socket if online
  for (const [socketId, player] of players) {
    if (player.userId === userId) {
      io.to(socketId).emit("error", { message: "Your account has been deleted", index: "f" });
      players.delete(socketId);
    }
  }

  db.deleteUser(userId);
  res.json({ success: true, message: "User deleted" });
});

// ============ ADMIN: ALL BET HISTORY ============
app.get("/api/admin/all-bets", adminMiddleware, (req, res) => {
  const bets = db.getAllGameHistory();
  res.json({ success: true, bets });
});

// ============ USER: OWN BET HISTORY ============
app.get("/api/user/bet-history", authMiddleware, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const bets = db.getGameHistoryByUser(user.username, 0); // 0 = no limit
  res.json({ success: true, bets });
});

// ============ ADMIN: REMOVE MONEY ============
app.post("/api/admin/remove-money", adminMiddleware, (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount || amount <= 0) return res.status(400).json({ error: "Invalid data" });

  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const deductAmount = Math.min(amount, user.balance);
  db.deductBalance(userId, deductAmount);

  // Update live socket
  for (const [socketId, player] of players) {
    if (player.userId === userId) {
      player.balance = Math.max(0, player.balance - amount);
      io.to(socketId).emit("myInfo", { balance: player.balance, userType: true, userName: player.userName, img: player.img });
    }
  }

  db.addTransaction(userId, "admin_debit", deductAmount, "approved");
  const updatedUser = db.findUserById(userId);
  res.json({ success: true, message: `Removed ₹${deductAmount}`, balance: updatedUser.balance });
});

// ============ CRASH POINT ============
function generateCrashPoint() {
  // If admin queued crash points, use them in order (one per round)
  if (manualCrashQueue.length > 0) {
    const cp = manualCrashQueue.shift();
    console.log(`[ADMIN] Using queued crash point: ${cp}x (${manualCrashQueue.length} remaining)`);
    return cp;
  }
  const e = Math.random();
  if (e < 0.04) return 1.0;
  return Math.max(1.0, Math.floor((100 / (e * 100)) * 100) / 100);
}

// ============ BOT LOGIC ============
function generateBots() {
  // Always 50 bots per round (matches what the user wants)
  const numBots = 50;
  const bots = [];
  // Shuffle all names and pick first N for variety each round
  const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(numBots, shuffled.length); i++) {
    // Bet amounts: weighted distribution — most are 20-500, some go higher
    let betAmount;
    const r = Math.random();
    if (r < 0.5) betAmount = Math.floor(Math.random() * 200) + 20;       // 20-220
    else if (r < 0.85) betAmount = Math.floor(Math.random() * 800) + 100; // 100-900
    else if (r < 0.97) betAmount = Math.floor(Math.random() * 3000) + 500; // 500-3500
    else betAmount = Math.floor(Math.random() * 10000) + 2000;            // 2000-12000

    // Targets: weighted - more bots cashout early (1.1x-2x), fewer at high values
    let target;
    const t = Math.random();
    if (t < 0.4) target = 1.1 + Math.random() * 0.9;       // 1.1-2.0x
    else if (t < 0.75) target = 2 + Math.random() * 2;      // 2-4x
    else if (t < 0.92) target = 4 + Math.random() * 4;      // 4-8x
    else target = 8 + Math.random() * 12;                   // 8-20x

    bots.push({
      name: shuffled[i],
      betAmount,
      cashOut: 0,
      cashouted: false,
      target: Math.round(target * 100) / 100,
      img: "",
      bot: true,
    });
  }
  return bots;
}

// Inverse of the multiplier formula:
// m = 1 + 0.06t + (0.06t)^2 - (0.04t)^3 + (0.04t)^4
// We solve for t given m using binary search (more accurate than approximation)
function timeForMultiplier(target) {
  if (target <= 1) return 0;
  let low = 0, high = 60; // 0 to 60 seconds (covers up to ~thousands x)
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const m = 1 + 0.06 * mid + Math.pow(0.06 * mid, 2) - Math.pow(0.04 * mid, 3) + Math.pow(0.04 * mid, 4);
    if (m < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

// ============ GAME LOOP ============
function startGameLoop() { runBetPhase(); }

function runBetPhase() {
  gameState = "BET";
  gameStartTime = Date.now();
  crashPoint = generateCrashPoint();
  bettedUsers = generateBots();

  console.log(`[GAME] Bet phase. Crash at: ${crashPoint}x`);
  io.emit("gameState", { currentNum: 0, currentSecondNum: 0, GameState: "BET", time: 0 });
  io.emit("bettedUserInfo", bettedUsers);
  io.emit("history", history.slice(0, 20));
  io.emit("getBetLimits", BET_LIMITS);
  setTimeout(() => runPlayPhase(), BET_PHASE_DURATION);
}

function runPlayPhase() {
  gameState = "PLAYING";
  gameStartTime = Date.now();
  console.log(`[GAME] Playing. Crash: ${crashPoint}x`);
  io.emit("gameState", { currentNum: 1, currentSecondNum: 0, GameState: "PLAYING", time: 0 });
  simulateBotCashouts();

  const interval = setInterval(() => {
    const elapsed = (Date.now() - gameStartTime) / 1000;
    const m = 1 + 0.06 * elapsed + Math.pow(0.06 * elapsed, 2) - Math.pow(0.04 * elapsed, 3) + Math.pow(0.04 * elapsed, 4);
    // Force crash if admin triggered it
    if (forceCrashNow) {
      forceCrashNow = false;
      crashPoint = Math.round(m * 100) / 100; // Set crash point to current multiplier
      clearInterval(interval);
      runGameEnd();
      return;
    }
    if (m >= crashPoint) { clearInterval(interval); runGameEnd(); }
  }, 50);
}

function simulateBotCashouts() {
  bettedUsers.forEach((bot) => {
    if (!bot.bot) return;
    if (bot.target >= crashPoint) return; // Bot loses (target above crash point)

    // Use exact inverse formula to find when multiplier = bot.target
    const targetTime = timeForMultiplier(bot.target);
    if (targetTime <= 0) return;

    setTimeout(() => {
      if (gameState !== "PLAYING") return;
      // Verify multiplier actually reached the target
      const elapsed = (Date.now() - gameStartTime) / 1000;
      const currentM = 1 + 0.06 * elapsed + Math.pow(0.06 * elapsed, 2) - Math.pow(0.04 * elapsed, 3) + Math.pow(0.04 * elapsed, 4);
      if (currentM >= bot.target) {
        bot.cashouted = true;
        bot.cashOut = bot.target;
        io.emit("bettedUserInfo", bettedUsers);
      }
    }, Math.max(50, targetTime * 1000));
  });
}

function runGameEnd() {
  gameState = "GAMEEND";
  console.log(`[GAME] Crashed at ${crashPoint}x`);
  history.unshift(crashPoint);
  if (history.length > 50) history.pop();

  // Persist to DB
  db.addCrashResult(crashPoint);

  io.emit("gameState", { currentNum: crashPoint, currentSecondNum: 0, GameState: "GAMEEND", time: 0 });

  for (const [socketId, player] of players) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) continue;

    const fCashouted = player.f.cashouted;
    const sCashouted = player.s.cashouted;
    const fCashAmount = fCashouted ? player.f.cashAmount : 0;
    const sCashAmount = sCashouted ? player.s.cashAmount : 0;

    // Save game history (only for losing bets - cashouts already saved at cashout time)
    if (player.f.betted && !player.f.cashouted && player.userId) {
      db.addGameHistory({ userId: player.userId, username: player.userName, betAmount: player.f.betAmount, cashoutAt: crashPoint, cashouted: false, profit: -player.f.betAmount });
    }
    if (player.s.betted && !player.s.cashouted && player.userId) {
      db.addGameHistory({ userId: player.userId, username: player.userName, betAmount: player.s.betAmount, cashoutAt: crashPoint, cashouted: false, profit: -player.s.betAmount });
    }

    // Save balance
    if (player.userId) db.updateUserBalance(player.userId, player.balance);

    socket.emit("finishGame", {
      balance: player.balance, userType: player.userType, userName: player.userName, img: player.img,
      f: { auto: player.f.auto, betted: false, cashouted: fCashouted, betAmount: player.f.betAmount, cashAmount: fCashAmount, target: player.f.target },
      s: { auto: player.s.auto, betted: false, cashouted: sCashouted, betAmount: player.s.betAmount, cashAmount: sCashAmount, target: player.s.target },
    });

    player.f = { auto: player.f.auto, betted: false, cashouted: false, betAmount: player.f.betAmount, cashAmount: 0, target: player.f.target, cashOutAt: 0 };
    player.s = { auto: player.s.auto, betted: false, cashouted: false, betAmount: player.s.betAmount, cashAmount: 0, target: player.s.target, cashOutAt: 0 };
  }

  previousHand = [...bettedUsers];
  io.emit("previousHand", previousHand);
  setTimeout(() => runBetPhase(), 3000);
}

// ============ SOCKET HANDLERS ============
io.on("connection", (socket) => {
  console.log(`[SOCKET] Connected: ${socket.id}`);

  socket.on("enterRoom", (data) => {
    let userName = `Guest_${socket.id.slice(0, 6)}`;
    let balance = 0;
    let userId = null;
    let img = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

    if (data && data.token) {
      try {
        const decoded = jwt.verify(data.token, JWT_SECRET);
        const user = db.findUserById(decoded.id);
        if (user) { userName = user.username; balance = user.balance; userId = user.id; img = user.img; }
      } catch (e) {}
    }

    const player = {
      userId, balance, userType: !!userId, userName, img,
      f: { auto: false, betted: false, cashouted: false, betAmount: 20, cashAmount: 0, target: 2, cashOutAt: 0 },
      s: { auto: false, betted: false, cashouted: false, betAmount: 20, cashAmount: 0, target: 2, cashOutAt: 0 },
    };
    players.set(socket.id, player);

    socket.emit("myInfo", { balance, userType: player.userType, userName, img });
    socket.emit("getBetLimits", BET_LIMITS);
    socket.emit("history", history.slice(0, 20));
    socket.emit("bettedUserInfo", bettedUsers);
    socket.emit("previousHand", previousHand);
    socket.emit("gameState", { currentNum: gameState === "GAMEEND" ? crashPoint : 0, currentSecondNum: 0, GameState: gameState, time: Date.now() - gameStartTime });

    console.log(`[SOCKET] ${userName} joined (₹${balance})`);
  });

  socket.on("playBet", (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    const { betAmount, target, type, auto } = data;

    if (betAmount < BET_LIMITS.min || betAmount > BET_LIMITS.max) { socket.emit("error", { message: "Invalid bet amount", index: type }); return; }
    if (player.balance < betAmount) { socket.emit("error", { message: "Insufficient balance", index: type }); return; }

    player.balance -= betAmount;
    player[type].betted = true;
    player[type].betAmount = betAmount;
    player[type].target = target || 2;
    player[type].auto = auto || false;
    player[type].cashouted = false;
    player[type].cashAmount = 0;

    bettedUsers.push({ name: player.userName, betAmount, cashOut: 0, cashouted: false, target: target || 2, img: player.img, bot: false });
    io.emit("bettedUserInfo", bettedUsers);
    socket.emit("myBetState", { balance: player.balance, userType: player.userType, userName: player.userName, img: player.img, f: player.f, s: player.s });
    socket.emit("myInfo", { balance: player.balance, userType: player.userType, userName: player.userName, img: player.img });
    console.log(`[BET] ${player.userName} bet ₹${betAmount} on ${type}`);
  });

  socket.on("cashOut", (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    const { type, endTarget } = data;

    if (gameState !== "PLAYING") { socket.emit("error", { message: "Game not in playing state", index: type }); return; }
    if (!player[type].betted || player[type].cashouted) return;

    const elapsed = (Date.now() - gameStartTime) / 1000;
    const currentMultiplier = 1 + 0.06 * elapsed + Math.pow(0.06 * elapsed, 2) - Math.pow(0.04 * elapsed, 3) + Math.pow(0.04 * elapsed, 4);
    const cashOutAt = Math.min(endTarget, currentMultiplier);
    const winAmount = player[type].betAmount * cashOutAt;

    player[type].cashouted = true;
    player[type].cashAmount = winAmount;
    player[type].cashOutAt = cashOutAt;
    player.balance += winAmount;

    // Save game history immediately on cashout (so history is recorded even if server restarts)
    if (player.userId) {
      const profit = winAmount - player[type].betAmount;
      db.addGameHistory({
        userId: player.userId,
        username: player.userName,
        betAmount: player[type].betAmount,
        cashoutAt: cashOutAt,
        cashouted: true,
        profit
      });
      db.updateUserBalance(player.userId, player.balance);
    }

    // CRITICAL: Mark as no longer betted so UI doesn't show CASHOUT button again
    player[type].betted = false;

    const entry = bettedUsers.find((u) => u.name === player.userName && !u.bot && !u.cashouted);
    if (entry) { entry.cashouted = true; entry.cashOut = cashOutAt; }

    io.emit("bettedUserInfo", bettedUsers);
    socket.emit("myBetState", {
      balance: player.balance, userType: player.userType, userName: player.userName, img: player.img,
      f: player.f,
      s: player.s,
    });
    socket.emit("myInfo", { balance: player.balance, userType: player.userType, userName: player.userName, img: player.img });
    socket.emit("success", `Cashed out at ${cashOutAt.toFixed(2)}x! Won ₹${winAmount.toFixed(2)}`);
    console.log(`[CASHOUT] ${player.userName} at ${cashOutAt.toFixed(2)}x, won ₹${winAmount.toFixed(2)}`);
  });

  socket.on("topUp", () => {
    const player = players.get(socket.id);
    if (!player) return;
    player.balance += 5000;
    if (player.userId) db.addBalance(player.userId, 5000);
    socket.emit("myInfo", { balance: player.balance, userType: player.userType, userName: player.userName, img: player.img });
    socket.emit("success", "Balance topped up! +₹5000");
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (player && player.userId) db.updateUserBalance(player.userId, player.balance);
    players.delete(socket.id);
  });
});

// ============ START ============
const PORT = parseInt(process.env.PORT || "5000", 10);

  // Express error handler — catch any thrown errors so the client always gets JSON
  // (rather than CORS-blocked HTML or hanging requests).
  app.use((err, req, res, next) => {
    console.error("[ERROR]", req.method, req.path, err.message);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  });

  server.listen(PORT, () => {
    console.log(`\n🚀 Aviator Crash Backend on http://localhost:${PORT}`);
    console.log(`📡 Auth + Game + SQLite Database ready\n`);
    startGameLoop();
  });

} // end startServer()

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
