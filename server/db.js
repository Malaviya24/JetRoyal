const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "aviator.sqlite");

let db = null;
let SQL = null;

// Initialize database
async function initDB() {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      balance REAL DEFAULT 0,
      img TEXT DEFAULT '/avatars/av-12.png',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      utr_number TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bank_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      account_holder TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      bank_name TEXT,
      upi_id TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      bet_amount REAL,
      cashout_at REAL,
      cashouted INTEGER DEFAULT 0,
      profit REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      upi_id TEXT DEFAULT 'aviator@upi',
      qr_image_url TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS crash_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crash_point REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Insert default settings if not exists
  const settingsRow = db.exec("SELECT COUNT(*) as cnt FROM settings");
  if (settingsRow.length === 0 || settingsRow[0].values[0][0] === 0) {
    db.run("INSERT INTO settings (id, upi_id, qr_image_url) VALUES (1, 'aviator@upi', '')");
  }

  saveToFile();
  console.log("[DB] SQLite database initialized");
  return db;
}

// Save database to file
function saveToFile() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Auto-save every 15 seconds
setInterval(() => saveToFile(), 15000);
process.on("exit", () => saveToFile());
process.on("SIGINT", () => { saveToFile(); process.exit(); });

// ============ HELPER ============
function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveToFile();
}

// ============ EXPORTS ============
module.exports = {
  initDB,

  // Users
  findUserByUsername(username) {
    return getOne("SELECT * FROM users WHERE username = ?", [username]);
  },

  findUserById(id) {
    return getOne("SELECT * FROM users WHERE id = ?", [id]);
  },

  createUser({ username, name, phone, password, img }) {
    run("INSERT INTO users (username, name, phone, password, balance, img) VALUES (?, ?, ?, ?, 0, ?)",
      [username, name, phone, password, img]);
    const user = getOne("SELECT * FROM users WHERE username = ?", [username]);
    return user;
  },

  updateUserBalance(id, balance) {
    run("UPDATE users SET balance = ? WHERE id = ?", [balance, id]);
  },

  addBalance(id, amount) {
    run("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, id]);
    const user = getOne("SELECT balance FROM users WHERE id = ?", [id]);
    return user ? user.balance : 0;
  },

  deductBalance(id, amount) {
    const user = getOne("SELECT balance FROM users WHERE id = ?", [id]);
    if (!user || user.balance < amount) return -1;
    run("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, id]);
    const updated = getOne("SELECT balance FROM users WHERE id = ?", [id]);
    return updated ? updated.balance : -1;
  },

  updatePassword(id, hashedPassword) {
    run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
  },

  getAllUsers() {
    return getAll("SELECT id, username, name, phone, balance, img, created_at FROM users ORDER BY id DESC");
  },

  // Bank Details
  getBankDetails(userId) {
    return getOne("SELECT * FROM bank_details WHERE user_id = ?", [userId]);
  },

  saveBankDetails(userId, details) {
    const existing = getOne("SELECT id FROM bank_details WHERE user_id = ?", [userId]);
    if (existing) {
      run("UPDATE bank_details SET account_holder=?, account_number=?, ifsc_code=?, bank_name=?, upi_id=?, updated_at=datetime('now') WHERE user_id=?",
        [details.accountHolder, details.accountNumber, details.ifscCode, details.bankName, details.upiId || "", userId]);
    } else {
      run("INSERT INTO bank_details (user_id, account_holder, account_number, ifsc_code, bank_name, upi_id) VALUES (?,?,?,?,?,?)",
        [userId, details.accountHolder, details.accountNumber, details.ifscCode, details.bankName, details.upiId || ""]);
    }
  },

  // Transactions
  addTransaction(userId, type, amount, status = "pending", utrNumber = "") {
    run("INSERT INTO transactions (user_id, type, amount, status, utr_number) VALUES (?,?,?,?,?)",
      [userId, type, amount, status, utrNumber]);
    return getOne("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);
  },

  getTransactions(userId) {
    return getAll("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [userId]);
  },

  getAllTransactions(type) {
    return getAll("SELECT * FROM transactions WHERE type = ? ORDER BY created_at DESC", [type]);
  },

  updateTransactionStatus(id, status) {
    const txn = getOne("SELECT * FROM transactions WHERE id = ?", [id]);
    if (!txn) return null;
    run("UPDATE transactions SET status = ? WHERE id = ?", [status, id]);
    return txn;
  },

  // Settings
  getSettings() {
    const row = getOne("SELECT * FROM settings WHERE id = 1");
    return row ? { upiId: row.upi_id, qrImageUrl: row.qr_image_url } : { upiId: "aviator@upi", qrImageUrl: "" };
  },

  saveSettings(settings) {
    const upiId = (settings && typeof settings.upiId === "string") ? settings.upiId : "";
    const qrImageUrl = (settings && typeof settings.qrImageUrl === "string") ? settings.qrImageUrl : "";
    run("UPDATE settings SET upi_id = ?, qr_image_url = ? WHERE id = 1", [upiId, qrImageUrl]);
    return { upiId, qrImageUrl };
  },

  // Game History
  addGameHistory(entry) {
    run("INSERT INTO game_history (user_id, username, bet_amount, cashout_at, cashouted, profit) VALUES (?,?,?,?,?,?)",
      [entry.userId, entry.username, entry.betAmount, entry.cashoutAt, entry.cashouted ? 1 : 0, entry.profit]);
  },

  getGameHistoryByUser(username, limit = 20) {
    const sql = limit > 0
      ? `SELECT id as _id, username as name, bet_amount as betAmount, cashout_at as cashoutAt, cashouted, profit, created_at as date FROM game_history WHERE username = ? ORDER BY created_at DESC LIMIT ${limit}`
      : `SELECT id as _id, username as name, bet_amount as betAmount, cashout_at as cashoutAt, cashouted, profit, created_at as date FROM game_history WHERE username = ? ORDER BY created_at DESC`;
    return getAll(sql, [username]);
  },

  getAllGameHistory() {
    return getAll("SELECT g.id as _id, g.username as name, g.bet_amount as betAmount, g.cashout_at as cashoutAt, g.cashouted, g.profit, g.created_at as date FROM game_history g ORDER BY g.created_at DESC");
  },

  getTopWinners() {
    return getAll("SELECT username as name, SUM(profit) as totalWin FROM game_history WHERE cashouted = 1 AND profit > 0 GROUP BY username ORDER BY totalWin DESC LIMIT 10");
  },

  // Crash History (round results)
  addCrashResult(crashPoint) {
    run("INSERT INTO crash_history (crash_point) VALUES (?)", [crashPoint]);
  },

  getRecentCrashHistory(limit = 50) {
    return getAll(`SELECT crash_point as crashPoint, created_at as time FROM crash_history ORDER BY id DESC LIMIT ${limit}`);
  },

  getAllCrashHistory() {
    return getAll("SELECT crash_point as crashPoint, created_at as time FROM crash_history ORDER BY id DESC");
  },

  // Delete User
  deleteUser(id) {
    run("DELETE FROM bank_details WHERE user_id = ?", [id]);
    run("DELETE FROM transactions WHERE user_id = ?", [id]);
    run("DELETE FROM game_history WHERE user_id = ?", [id]);
    run("DELETE FROM users WHERE id = ?", [id]);
  },

  // Stats
  getStats() {    const totalUsers = getOne("SELECT COUNT(*) as cnt FROM users");
    const totalDeposits = getOne("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'deposit' AND status = 'approved'");
    const totalWithdrawals = getOne("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'withdrawal' AND status = 'approved'");
    return {
      totalUsers: totalUsers ? totalUsers.cnt : 0,
      totalDeposits: totalDeposits ? totalDeposits.total : 0,
      totalWithdrawals: totalWithdrawals ? totalWithdrawals.total : 0,
    };
  },
};
