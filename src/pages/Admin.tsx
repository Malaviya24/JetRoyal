import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import "./admin.scss";

interface UserData {
  id: number;
  username: string;
  name: string;
  phone: string;
  balance: number;
}

interface GameResult {
  crashPoint: number;
  time: string;
}

interface Transaction {
  id: number;
  userId: number;
  username: string;
  type: string;
  amount: number;
  status: string;
  utrNumber: string;
  createdAt: string;
}

interface Settings {
  upiId: string;
  qrImageUrl: string;
}

interface Stats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

type TabType = "dashboard" | "crash" | "results" | "users" | "deposits" | "withdrawals" | "settings" | "userdetails" | "allbets";

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>("dashboard");
  const [crashPoint, setCrashPoint] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [allBets, setAllBets] = useState<any[]>([]);
  const [settings, setSettings] = useState<Settings>({ upiId: "", qrImageUrl: "" });
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0 });
  const [addMoneyUser, setAddMoneyUser] = useState("");
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [removeMoneyAmount, setRemoveMoneyAmount] = useState("");
  const [removeMoneyUser, setRemoveMoneyUser] = useState("");

  const ADMIN_PASSWORD = "admin123";

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/users`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (e) {}
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/results`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setResults(data.results);
    } catch (e) {}
  }, []);

  const fetchDeposits = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/deposits`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setDeposits(data.deposits);
    } catch (e) {}
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/withdrawals`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setWithdrawals(data.withdrawals);
    } catch (e) {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/settings`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (e) {}
  }, []);

  const fetchAllBets = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/all-bets`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setAllBets(data.bets);
    } catch (e) {}
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/stats`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) {}
  }, []);

  const fetchUserDetails = async (userId: number) => {
    try {
      const res = await fetch(`${config.api}/admin/user-details/${userId}`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) {
        setUserDetails(data);
        setSelectedUser(userId);
        setTab("userdetails");
      }
    } catch (e) {}
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${config.api}/admin/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User deleted");
        setTab("users");
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch (e) { toast.error("Server error"); }
  };

  const handleRemoveMoney = async (userId: number) => {
    const amount = parseFloat(removeMoneyAmount);
    if (!amount || amount <= 0) { toast.error("Enter valid amount"); return; }
    try {
      const res = await fetch(`${config.api}/admin/remove-money`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Removed ₹${amount}`);
        setRemoveMoneyAmount("");
        setRemoveMoneyUser("");
        fetchUserDetails(userId);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch (e) { toast.error("Server error"); }
  };

  useEffect(() => {
    if (authenticated) {      fetchStats();
      fetchUsers();
      fetchResults();
      fetchDeposits();
      fetchWithdrawals();
      fetchSettings();
      fetchAllBets();
      const interval = setInterval(() => {
        fetchResults();
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchUsers, fetchResults, fetchDeposits, fetchWithdrawals, fetchSettings, fetchStats, fetchAllBets]);

  const handleSetCrash = async () => {
    const value = parseFloat(crashPoint);
    if (!value || value < 1.01) {
      toast.error("Crash point must be at least 1.01");
      return;
    }
    try {
      const res = await fetch(`${config.api}/admin/set-crash`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify({ crashPoint: value }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Next crash set to ${value}x`);
        setCrashPoint("");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  };

  const handleAddMoney = async (userId: number) => {
    const amount = parseFloat(addMoneyAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      const res = await fetch(`${config.api}/admin/add-money`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Added ₹${amount} to user`);
        setAddMoneyAmount("");
        setAddMoneyUser("");
        fetchUsers();
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  };

  const handleDepositAction = async (id: number, action: string) => {
    try {
      const res = await fetch(`${config.api}/admin/deposit-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchDeposits();
        fetchStats();
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  };

  const handleWithdrawalAction = async (id: number, action: string) => {
    try {
      const res = await fetch(`${config.api}/admin/withdrawal-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchWithdrawals();
        fetchStats();
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${config.api}/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_PASSWORD },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved!");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("qrImage", file);

    try {
      const res = await fetch(`${config.api}/admin/upload-qr`, {
        method: "POST",
        headers: { "x-admin-key": ADMIN_PASSWORD },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, qrImageUrl: data.qrImageUrl });
        toast.success("QR image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const menuItems: { key: TabType; icon: string; label: string }[] = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "crash", icon: "🎯", label: "Set Crash Point" },
    { key: "results", icon: "📈", label: "Game Results" },
    { key: "users", icon: "👥", label: "All Users" },
    { key: "deposits", icon: "💰", label: "Deposit Requests" },
    { key: "withdrawals", icon: "🏧", label: "Withdrawal Requests" },
    { key: "allbets" as TabType, icon: "🎲", label: "All Bets History" },
    { key: "settings", icon: "⚙️", label: "Settings" },
    { key: "userdetails", icon: "👤", label: selectedUser ? `User #${selectedUser}` : "User Details" },
  ];

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h1>🔐 Admin Panel</h1>
          <p>Enter admin password</p>
          <input
            type="password"
            placeholder="Admin password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (adminPass === ADMIN_PASSWORD) {
                  setAuthenticated(true);
                } else {
                  toast.error("Wrong password");
                }
              }
            }}
          />
          <button
            onClick={() => {
              if (adminPass === ADMIN_PASSWORD) {
                setAuthenticated(true);
              } else {
                toast.error("Wrong password");
              }
            }}
          >
            LOGIN
          </button>
          <button className="back" onClick={() => navigate("/login")}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>✈️ Aviator</h2>
          <span>Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => { setTab(item.key); setSidebarOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setAuthenticated(false)}>🚪 Logout</button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{menuItems.find((m) => m.key === tab)?.icon} {tab === "userdetails" && userDetails ? `User: ${userDetails.user.username}` : menuItems.find((m) => m.key === tab)?.label}</h1>
        </div>

        <div className="admin-content">
          {/* Dashboard */}
          {tab === "dashboard" && (
            <div className="dashboard-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalUsers}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-value green">₹{stats.totalDeposits.toLocaleString()}</span>
                    <span className="stat-label">Total Deposits</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏧</div>
                  <div className="stat-info">
                    <span className="stat-value red">₹{stats.totalWithdrawals.toLocaleString()}</span>
                    <span className="stat-label">Total Withdrawals</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Set Crash */}
          {tab === "crash" && (
            <div className="crash-control">
              <h2>Set Next Crash Point</h2>
              <p className="desc">The plane will fly away at this multiplier in the next round</p>
              <div className="crash-input-row">
                <input
                  type="number"
                  placeholder="e.g. 2.50"
                  value={crashPoint}
                  onChange={(e) => setCrashPoint(e.target.value)}
                  min="1.01"
                  step="0.01"
                />
                <span className="x-label">x</span>
                <button onClick={handleSetCrash}>SET CRASH</button>
              </div>
              <div className="quick-crash">
                {[1.1, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0].map((v) => (
                  <button key={v} onClick={() => setCrashPoint(String(v))} className={crashPoint === String(v) ? "active" : ""}>
                    {v}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Results */}
          {tab === "results" && (
            <div className="results-section">
              <div className="section-header">
                <h2>Last 20 Game Results</h2>
                <button className="refresh-btn" onClick={fetchResults}>🔄 Refresh</button>
              </div>
              <div className="results-grid">
                {results.length === 0 ? (
                  <p className="no-data">No results yet</p>
                ) : (
                  results.map((r, i) => (
                    <div key={i} className={`result-item ${r.crashPoint < 2 ? "red" : r.crashPoint >= 5 ? "green" : "blue"}`}>
                      <span className="crash-val">{r.crashPoint.toFixed(2)}x</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* All Users */}
          {tab === "users" && (
            <div className="users-section">
              <div className="section-header">
                <h2>All Users ({users.length})</h2>
                <button className="refresh-btn" onClick={fetchUsers}>🔄 Refresh</button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="no-data">No users registered yet</td></tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.name}</td>
                          <td>{user.phone}</td>
                          <td className="balance">₹{user.balance.toFixed(2)}</td>
                          <td>
                            <div className="action-btns">
                              <button className="view-btn" onClick={() => fetchUserDetails(user.id)}>👁 View</button>
                              {addMoneyUser === String(user.id) ? (
                                <div className="add-money-inline">
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={addMoneyAmount}
                                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                                  />
                                  <button className="confirm-btn" onClick={() => handleAddMoney(user.id)}>✓</button>
                                  <button className="cancel-btn" onClick={() => setAddMoneyUser("")}>✗</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => setAddMoneyUser(String(user.id))}>+ Add</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deposit Requests */}
          {tab === "deposits" && (
            <div className="transactions-section">
              <div className="section-header">
                <h2>Deposit Requests</h2>
                <button className="refresh-btn" onClick={fetchDeposits}>🔄 Refresh</button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>UTR Number</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.length === 0 ? (
                      <tr><td colSpan={6} className="no-data">No deposit requests</td></tr>
                    ) : (
                      deposits.map((txn) => (
                        <tr key={txn.id}>
                          <td>{txn.username}</td>
                          <td className="amount">₹{txn.amount}</td>
                          <td>{txn.utrNumber || "-"}</td>
                          <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td><span className={`status-badge ${txn.status}`}>{txn.status}</span></td>
                          <td>
                            {txn.status === "pending" ? (
                              <div className="action-btns">
                                <button className="approve-btn" onClick={() => handleDepositAction(txn.id, "approve")}>✓ Approve</button>
                                <button className="reject-btn" onClick={() => handleDepositAction(txn.id, "reject")}>✗ Reject</button>
                              </div>
                            ) : (
                              <span className="done">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Withdrawal Requests */}
          {tab === "withdrawals" && (
            <div className="transactions-section">
              <div className="section-header">
                <h2>Withdrawal Requests</h2>
                <button className="refresh-btn" onClick={fetchWithdrawals}>🔄 Refresh</button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length === 0 ? (
                      <tr><td colSpan={5} className="no-data">No withdrawal requests</td></tr>
                    ) : (
                      withdrawals.map((txn) => (
                        <tr key={txn.id}>
                          <td>{txn.username}</td>
                          <td className="amount">₹{txn.amount}</td>
                          <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td><span className={`status-badge ${txn.status}`}>{txn.status}</span></td>
                          <td>
                            {txn.status === "pending" ? (
                              <div className="action-btns">
                                <button className="approve-btn" onClick={() => handleWithdrawalAction(txn.id, "approve")}>✓ Approve</button>
                                <button className="reject-btn" onClick={() => handleWithdrawalAction(txn.id, "reject")}>✗ Reject</button>
                              </div>
                            ) : (
                              <span className="done">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div className="settings-section">
              <h2>Payment Settings</h2>
              <p className="desc">Configure UPI ID and QR code for the deposit page</p>
              <div className="settings-form">
                <div className="setting-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@upi"
                    value={settings.upiId}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  />
                </div>
                <div className="setting-group">
                  <label>QR Code Image</label>
                  <div className="qr-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      id="qr-upload-input"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="qr-upload-input" className="qr-upload-btn">
                      📷 Upload QR Image from Gallery
                    </label>
                    {settings.qrImageUrl && (
                      <div className="qr-preview">
                        <img src={settings.qrImageUrl} alt="QR Preview" />
                        <button
                          type="button"
                          className="qr-remove-btn"
                          onClick={() => setSettings({ ...settings, qrImageUrl: "" })}
                        >
                          ✗ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button className="save-btn" onClick={handleSaveSettings}>💾 Save Settings</button>
              </div>
            </div>
          )}

          {/* All Bets History */}
          {tab === "allbets" && (
            <div className="transactions-section">
              <div className="section-header">
                <h2>All Bets History ({allBets.length})</h2>
                <button className="refresh-btn" onClick={fetchAllBets}>🔄 Refresh</button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Date</th>
                      <th>Bet (₹)</th>
                      <th>Cashout</th>
                      <th>Result</th>
                      <th>Profit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBets.length === 0 ? (
                      <tr><td colSpan={7} className="no-data">No bets yet</td></tr>
                    ) : (
                      allBets.map((bet, i) => (
                        <tr key={bet._id}>
                          <td>{allBets.length - i}</td>
                          <td>{bet.name}</td>
                          <td>{new Date(bet.date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                          <td>₹{Number(bet.betAmount).toFixed(2)}</td>
                          <td>{bet.cashouted ? `${Number(bet.cashoutAt).toFixed(2)}x` : "—"}</td>
                          <td>
                            {bet.cashouted
                              ? <span className="status-badge approved">WIN</span>
                              : <span className="status-badge rejected">LOSE</span>}
                          </td>
                          <td className={Number(bet.profit) >= 0 ? "green" : "red"}>
                            {Number(bet.profit) >= 0 ? "+" : ""}₹{Number(bet.profit).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Details */}
          {tab === "userdetails" && (
            <div className="user-details-section">
              {!userDetails ? (
                <p className="no-data">No user selected. Click "View" on a user from the Users tab.</p>
              ) : (
                <>
                  <div className="section-header">
                    <h2>👤 User #{userDetails.user.id} — {userDetails.user.username}</h2>
                    <div className="action-btns">
                      <button className="refresh-btn" onClick={() => fetchUserDetails(userDetails.user.id)}>🔄 Refresh</button>
                      <button className="reject-btn" onClick={() => handleDeleteUser(userDetails.user.id)}>🗑 Delete Account</button>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="detail-card">
                    <h3>User Info</h3>
                    <div className="detail-grid">
                      <div className="detail-row"><span className="detail-label">ID</span><span className="detail-val">{userDetails.user.id}</span></div>
                      <div className="detail-row"><span className="detail-label">Username</span><span className="detail-val">{userDetails.user.username}</span></div>
                      <div className="detail-row"><span className="detail-label">Name</span><span className="detail-val">{userDetails.user.name}</span></div>
                      <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-val">{userDetails.user.phone}</span></div>
                      <div className="detail-row"><span className="detail-label">Balance</span><span className="detail-val green">₹{Number(userDetails.user.balance).toFixed(2)}</span></div>
                      <div className="detail-row"><span className="detail-label">Joined</span><span className="detail-val">{new Date(userDetails.user.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  {/* Money Actions */}
                  <div className="detail-card">
                    <h3>Money Actions</h3>
                    <div className="money-actions-row">
                      <div className="money-action-group">
                        <label>Add Money</label>
                        <div className="add-money-inline">
                          {addMoneyUser === String(userDetails.user.id) ? (
                            <>
                              <input type="number" placeholder="Amount" value={addMoneyAmount} onChange={(e) => setAddMoneyAmount(e.target.value)} />
                              <button className="confirm-btn" onClick={() => { handleAddMoney(userDetails.user.id); setAddMoneyUser(""); }}>✓ Add</button>
                              <button className="cancel-btn" onClick={() => setAddMoneyUser("")}>✗</button>
                            </>
                          ) : (
                            <button className="add-btn" onClick={() => setAddMoneyUser(String(userDetails.user.id))}>+ Add Money</button>
                          )}
                        </div>
                      </div>
                      <div className="money-action-group">
                        <label>Remove Money</label>
                        <div className="add-money-inline">
                          {removeMoneyUser === String(userDetails.user.id) ? (
                            <>
                              <input type="number" placeholder="Amount" value={removeMoneyAmount} onChange={(e) => setRemoveMoneyAmount(e.target.value)} />
                              <button className="confirm-btn" style={{ background: "#e53e3e" }} onClick={() => handleRemoveMoney(userDetails.user.id)}>✓ Remove</button>
                              <button className="cancel-btn" onClick={() => setRemoveMoneyUser("")}>✗</button>
                            </>
                          ) : (
                            <button className="reject-btn" onClick={() => setRemoveMoneyUser(String(userDetails.user.id))}>− Remove Money</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="detail-card">
                    <h3>Bank Details</h3>
                    {!userDetails.bank ? (
                      <p className="no-data">No bank details added</p>
                    ) : (
                      <div className="detail-grid">
                        <div className="detail-row"><span className="detail-label">Account Holder</span><span className="detail-val">{userDetails.bank.account_holder}</span></div>
                        <div className="detail-row"><span className="detail-label">Account Number</span><span className="detail-val">{userDetails.bank.account_number}</span></div>
                        <div className="detail-row"><span className="detail-label">IFSC Code</span><span className="detail-val">{userDetails.bank.ifsc_code}</span></div>
                        <div className="detail-row"><span className="detail-label">Bank Name</span><span className="detail-val">{userDetails.bank.bank_name}</span></div>
                        <div className="detail-row"><span className="detail-label">UPI ID</span><span className="detail-val">{userDetails.bank.upi_id || "—"}</span></div>
                      </div>
                    )}
                  </div>

                  {/* Bet History */}
                  <div className="detail-card">
                    <h3>Last 20 Bets</h3>
                    {!userDetails.bets || userDetails.bets.length === 0 ? (
                      <p className="no-data">No bets yet</p>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Bet Amount</th>
                              <th>Cashout At</th>
                              <th>Cashouted</th>
                              <th>Profit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.bets.map((bet: any, i: number) => (
                              <tr key={i}>
                                <td>{new Date(bet.date).toLocaleDateString()}</td>
                                <td>₹{Number(bet.betAmount).toFixed(2)}</td>
                                <td>{Number(bet.cashoutAt).toFixed(2)}x</td>
                                <td>{bet.cashouted ? <span className="status-badge approved">Yes</span> : <span className="status-badge rejected">No</span>}</td>
                                <td className={Number(bet.profit) >= 0 ? "green" : "red"}>₹{Number(bet.profit).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Transaction History */}
                  <div className="detail-card">
                    <h3>Transaction History</h3>
                    {!userDetails.transactions || userDetails.transactions.length === 0 ? (
                      <p className="no-data">No transactions yet</p>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.transactions.map((txn: any, i: number) => (
                              <tr key={i}>
                                <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                                <td>{txn.type}</td>
                                <td>₹{Number(txn.amount).toFixed(2)}</td>
                                <td><span className={`status-badge ${txn.status}`}>{txn.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
