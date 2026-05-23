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

type TabType = "dashboard" | "crash" | "results" | "users" | "deposits" | "withdrawals" | "settings";

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>("dashboard");
  const [crashPoint, setCrashPoint] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>({ upiId: "", qrImageUrl: "" });
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0 });
  const [addMoneyUser, setAddMoneyUser] = useState("");
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/stats`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      fetchUsers();
      fetchResults();
      fetchDeposits();
      fetchWithdrawals();
      fetchSettings();
      const interval = setInterval(() => {
        fetchResults();
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchUsers, fetchResults, fetchDeposits, fetchWithdrawals, fetchSettings, fetchStats]);

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

  const menuItems: { key: TabType; icon: string; label: string }[] = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "crash", icon: "🎯", label: "Set Crash Point" },
    { key: "results", icon: "📈", label: "Game Results" },
    { key: "users", icon: "👥", label: "All Users" },
    { key: "deposits", icon: "💰", label: "Deposit Requests" },
    { key: "withdrawals", icon: "🏧", label: "Withdrawal Requests" },
    { key: "settings", icon: "⚙️", label: "Settings" },
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
          <h1>{menuItems.find((m) => m.key === tab)?.icon} {menuItems.find((m) => m.key === tab)?.label}</h1>
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
                      <th>Action</th>
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
                              <button className="add-btn" onClick={() => setAddMoneyUser(String(user.id))}>+ Add Money</button>
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
                  <label>QR Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/qr.png"
                    value={settings.qrImageUrl}
                    onChange={(e) => setSettings({ ...settings, qrImageUrl: e.target.value })}
                  />
                  {settings.qrImageUrl && (
                    <div className="qr-preview">
                      <img src={settings.qrImageUrl} alt="QR Preview" />
                    </div>
                  )}
                </div>
                <button className="save-btn" onClick={handleSaveSettings}>💾 Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
