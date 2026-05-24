import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import "./admin.scss";

// =====================================================
// Icon Set — clean inline SVGs (Lucide-style stroke icons)
// =====================================================
const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icons = {
  Dashboard: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Activity: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Target: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  TrendingUp: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Users: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  DollarSign: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  CreditCard: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  ListChecks: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Settings: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  User: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  LogOut: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Lock: ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Key: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Check: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} strokeWidth={3}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  RefreshCw: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Eye: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Trash2: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Upload: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Save: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Plane: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  ),
  Bot: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  Crash: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Clock: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  ListPlus: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <line x1="11" y1="12" x2="3" y2="12" />
      <line x1="16" y1="6" x2="3" y2="6" />
      <line x1="11" y1="18" x2="3" y2="18" />
      <line x1="19" y1="9" x2="19" y2="15" />
      <line x1="22" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Search: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Plus: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} strokeWidth={3}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minus: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} strokeWidth={3}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Zap: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

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

type TabType =
  | "dashboard"
  | "crash"
  | "results"
  | "users"
  | "deposits"
  | "withdrawals"
  | "settings"
  | "userdetails"
  | "allbets"
  | "livebets";

type IconKey = keyof typeof Icons;

interface MenuItem {
  key: TabType;
  icon: IconKey;
  label: string;
  section: "MAIN" | "MANAGE" | "SETTINGS";
}

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>("dashboard");
  const [crashPoint, setCrashPoint] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [allBets, setAllBets] = useState<any[]>([]);
  const [crashQueue, setCrashQueue] = useState<number[]>([]);
  const [liveBets, setLiveBets] = useState<any>(null);
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
  const [search, setSearch] = useState("");

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

  const fetchCrashQueue = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/crash-queue`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setCrashQueue(data.queue);
    } catch (e) {}
  }, []);

  const fetchLiveBets = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/admin/live-bets`, {
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      const data = await res.json();
      if (data.success) setLiveBets(data);
    } catch (e) {}
  }, []);

  const removeFromQueue = async (idx: number) => {
    try {
      await fetch(`${config.api}/admin/crash-queue/${idx}`, {
        method: "DELETE",
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      fetchCrashQueue();
    } catch (e) {}
  };

  const clearQueue = async () => {
    if (!window.confirm("Clear all queued crash points?")) return;
    try {
      await fetch(`${config.api}/admin/clear-crash-queue`, {
        method: "POST",
        headers: { "x-admin-key": ADMIN_PASSWORD },
      });
      toast.success("Queue cleared");
      fetchCrashQueue();
    } catch (e) {}
  };

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
    } catch (e) {
      toast.error("Server error");
    }
  };

  const handleRemoveMoney = async (userId: number) => {
    const amount = parseFloat(removeMoneyAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }
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
    } catch (e) {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      fetchUsers();
      fetchResults();
      fetchDeposits();
      fetchWithdrawals();
      fetchSettings();
      fetchAllBets();
      fetchCrashQueue();
      fetchLiveBets();
      const interval = setInterval(() => {
        fetchResults();
        fetchStats();
        fetchCrashQueue();
        if (tab === "livebets") fetchLiveBets();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [
    authenticated,
    tab,
    fetchUsers,
    fetchResults,
    fetchDeposits,
    fetchWithdrawals,
    fetchSettings,
    fetchStats,
    fetchAllBets,
    fetchCrashQueue,
    fetchLiveBets,
  ]);

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
        toast.success(data.message);
        setCrashPoint("");
        fetchCrashQueue();
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

  const menuItems: MenuItem[] = [
    { key: "dashboard", icon: "Dashboard", label: "Dashboard", section: "MAIN" },
    { key: "livebets", icon: "Activity", label: "Live Bets", section: "MAIN" },
    { key: "crash", icon: "Target", label: "Set Crash Point", section: "MAIN" },
    { key: "results", icon: "TrendingUp", label: "Game Results", section: "MAIN" },
    { key: "users", icon: "Users", label: "All Users", section: "MANAGE" },
    { key: "deposits", icon: "DollarSign", label: "Deposit Requests", section: "MANAGE" },
    { key: "withdrawals", icon: "CreditCard", label: "Withdrawal Requests", section: "MANAGE" },
    { key: "allbets", icon: "ListChecks", label: "All Bets History", section: "MANAGE" },
    { key: "settings", icon: "Settings", label: "Settings", section: "SETTINGS" },
    {
      key: "userdetails",
      icon: "User",
      label: selectedUser ? `User #${selectedUser}` : "User Details",
      section: "SETTINGS",
    },
  ];

  const filteredMenu = menuItems.filter((m) =>
    search.trim() === "" ? true : m.label.toLowerCase().includes(search.toLowerCase())
  );

  const sectionsOrder: Array<MenuItem["section"]> = ["MAIN", "MANAGE", "SETTINGS"];
  const groupedMenu = sectionsOrder.map((sec) => ({
    section: sec,
    items: filteredMenu.filter((m) => m.section === sec),
  }));

  const currentItem = menuItems.find((m) => m.key === tab);
  const CurrentIcon = currentItem ? Icons[currentItem.icon] : Icons.Dashboard;

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <div className="login-icon">
            <Icons.Lock size={26} />
          </div>
          <h1>Admin Panel</h1>
          <p>Enter admin password to continue</p>
          <div className="login-field">
            <span className="field-icon">
              <Icons.Key size={16} />
            </span>
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
          </div>
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
          <button className="back" onClick={() => navigate("/login")}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" {...svgProps}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">
            <Icons.Plane size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Aviator Admin</span>
            <span className="brand-sub">Control Panel</span>
          </div>
        </div>

        <div className="sidebar-search">
          <span className="search-icon">
            <Icons.Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <nav className="sidebar-nav">
          {groupedMenu.map(
            (group) =>
              group.items.length > 0 && (
                <React.Fragment key={group.section}>
                  <div className="nav-section-label">{group.section}</div>
                  {group.items.map((item) => {
                    const Icon = Icons[item.icon];
                    const badgeCount =
                      item.key === "deposits"
                        ? deposits.filter((d) => d.status === "pending").length
                        : item.key === "withdrawals"
                        ? withdrawals.filter((d) => d.status === "pending").length
                        : 0;
                    return (
                      <button
                        key={item.key}
                        className={`nav-item ${tab === item.key ? "active" : ""}`}
                        onClick={() => {
                          setTab(item.key);
                          setSidebarOpen(false);
                        }}
                      >
                        <span className="nav-icon">
                          <Icon size={18} />
                        </span>
                        <span className="nav-label">{item.label}</span>
                        {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
                      </button>
                    );
                  })}
                </React.Fragment>
              )
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setAuthenticated(false)}>
            <Icons.LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <span className="topbar-icon">
              <CurrentIcon size={18} />
            </span>
            <div>
              <h1>
                {tab === "userdetails" && userDetails
                  ? `User: ${userDetails.user.username}`
                  : currentItem?.label}
              </h1>
              <div className="breadcrumb">Admin / {currentItem?.section}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="btn-ghost" onClick={() => setAuthenticated(false)}>
              <Icons.LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* Dashboard */}
          {tab === "dashboard" && (
            <div className="dashboard-section">
              <h2 className="section-title">Overview</h2>
              <p className="desc">A snapshot of your platform's key metrics.</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Icons.Users size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalUsers}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                </div>
                <div className="stat-card green">
                  <div className="stat-icon">
                    <Icons.DollarSign size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value green">
                      ₹{stats.totalDeposits.toLocaleString()}
                    </span>
                    <span className="stat-label">Total Deposits</span>
                  </div>
                </div>
                <div className="stat-card red">
                  <div className="stat-icon">
                    <Icons.CreditCard size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value red">
                      ₹{stats.totalWithdrawals.toLocaleString()}
                    </span>
                    <span className="stat-label">Total Withdrawals</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Set Crash */}
          {tab === "crash" && (
            <div className="crash-control">
              <h2 className="section-title">Crash Point Queue</h2>
              <p className="desc">
                Queue crash points one by one. Each round will use the next one in queue. After the
                queue is empty, random crashes resume.
              </p>

              <div className="detail-card">
                <h3>
                  <span className="header-icon">
                    <Icons.ListPlus size={16} />
                  </span>
                  Add Crash Point
                </h3>
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
                  <button onClick={handleSetCrash}>
                    <Icons.Plus size={14} />
                    <span>Add to Queue</span>
                  </button>
                </div>
                <div className="quick-crash">
                  {[1.1, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCrashPoint(String(v))}
                      className={crashPoint === String(v) ? "active" : ""}
                    >
                      {v}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue display */}
              <div className="detail-card">
                <div className="section-header">
                  <h3>
                    <span className="header-icon">
                      <Icons.Clock size={16} />
                    </span>
                    Pending Queue ({crashQueue.length})
                  </h3>
                  {crashQueue.length > 0 && (
                    <button className="reject-btn" onClick={clearQueue}>
                      <Icons.Trash2 size={12} />
                      <span>Clear Queue</span>
                    </button>
                  )}
                </div>
                {crashQueue.length === 0 ? (
                  <p className="no-data">No queued crashes. Random crashes will be used.</p>
                ) : (
                  <div className="queue-list">
                    {crashQueue.map((cp, i) => (
                      <div key={i} className="queue-item">
                        <span className="queue-position">#{i + 1}</span>
                        <span
                          className={`queue-value ${
                            cp < 2 ? "red" : cp >= 5 ? "green" : "blue"
                          }`}
                        >
                          {cp.toFixed(2)}x
                        </span>
                        <button
                          className="queue-remove"
                          onClick={() => removeFromQueue(i)}
                          aria-label="Remove"
                        >
                          <Icons.X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Bets */}
          {tab === "livebets" && (
            <div className="livebets-section">
              <div className="section-header">
                <h2>
                  <span className="header-icon">
                    <Icons.Activity size={18} />
                  </span>
                  Live Round
                </h2>
                <button className="refresh-btn" onClick={fetchLiveBets}>
                  <Icons.RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>

              {!liveBets ? (
                <p className="no-data">Loading...</p>
              ) : (
                <>
                  {/* Live Status Cards */}
                  <div className="stats-grid">
                    <div className="stat-card blue">
                      <div className="stat-icon">
                        {liveBets.gameState === "PLAYING" ? (
                          <Icons.Plane size={22} />
                        ) : liveBets.gameState === "BET" ? (
                          <Icons.Clock size={22} />
                        ) : (
                          <Icons.Crash size={22} />
                        )}
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{liveBets.gameState}</span>
                        <span className="stat-label">Game State</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Icons.Target size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{liveBets.crashPoint?.toFixed(2)}x</span>
                        <span className="stat-label">This Round Crash</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Icons.ListChecks size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{liveBets.queueLength}</span>
                        <span className="stat-label">Queue Pending</span>
                      </div>
                    </div>
                    <div className="stat-card green">
                      <div className="stat-icon">
                        <Icons.Zap size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{liveBets.totalBets}</span>
                        <span className="stat-label">Total Bets</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick set crash from live view */}
                  <div className="detail-card quick-set-card">
                    <h3>
                      <span className="header-icon">
                        <Icons.Zap size={16} />
                      </span>
                      Quick Set Next Crash
                    </h3>
                    <div className="crash-input-row">
                      <input
                        type="number"
                        placeholder="e.g. 1.5"
                        value={crashPoint}
                        onChange={(e) => setCrashPoint(e.target.value)}
                        min="1.01"
                        step="0.01"
                      />
                      <span className="x-label">x</span>
                      <button onClick={handleSetCrash}>
                        <Icons.Plus size={14} />
                        <span>Queue</span>
                      </button>
                    </div>
                    <div className="quick-crash">
                      {[1.05, 1.2, 1.5, 2, 3, 5, 10, 20].map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setCrashPoint(String(v));
                          }}
                          className={crashPoint === String(v) ? "active" : ""}
                        >
                          {v}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CRASH NOW button */}
                  <div className="detail-card crash-now-card">
                    <h3>
                      <span className="header-icon" style={{ color: "#e63946" }}>
                        <Icons.Crash size={16} />
                      </span>
                      Emergency Crash
                    </h3>
                    <p style={{ color: "#9ea0a3", fontSize: "12px", margin: "0 0 14px" }}>
                      Force the plane to crash immediately at the current multiplier. Only works during PLAYING phase.
                    </p>
                    <button
                      className="crash-now-btn"
                      onClick={async () => {
                        try {
                          const res = await fetch(`${config.api}/admin/crash-now`, {
                            method: "POST",
                            headers: { "x-admin-key": ADMIN_PASSWORD },
                          });
                          const data = await res.json();
                          if (data.success) toast.success(data.message);
                          else toast.error(data.error || "Failed");
                        } catch (e) { toast.error("Server error"); }
                      }}
                      disabled={liveBets?.gameState !== "PLAYING"}
                    >
                      <Icons.Crash size={18} />
                      <span>CRASH NOW</span>
                    </button>
                  </div>

                  <div className="live-tables">
                    {/* Real Players */}
                    <div className="detail-card">
                      <h3>
                        <span className="header-icon">
                          <Icons.User size={16} />
                        </span>
                        Real Players ({liveBets.realPlayers?.length || 0})
                      </h3>
                      {!liveBets.realPlayers || liveBets.realPlayers.length === 0 ? (
                        <p className="no-data">No real player bets this round</p>
                      ) : (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Player</th>
                                <th>Bet (₹)</th>
                                <th>Target</th>
                                <th>Cashed Out</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {liveBets.realPlayers.map((p: any, i: number) => (
                                <tr key={i}>
                                  <td>{p.name}</td>
                                  <td>₹{Number(p.betAmount).toFixed(2)}</td>
                                  <td>{Number(p.target).toFixed(2)}x</td>
                                  <td>
                                    {p.cashouted ? `${Number(p.cashOut).toFixed(2)}x` : "—"}
                                  </td>
                                  <td>
                                    {p.cashouted ? (
                                      <span className="status-badge approved">Cashed Out</span>
                                    ) : (
                                      <span className="status-badge pending">Active</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Bots */}
                    <div className="detail-card">
                      <h3>
                        <span className="header-icon">
                          <Icons.Bot size={16} />
                        </span>
                        Bots ({liveBets.bots?.length || 0})
                      </h3>
                      {!liveBets.bots || liveBets.bots.length === 0 ? (
                        <p className="no-data">No bots</p>
                      ) : (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Bot</th>
                                <th>Bet (₹)</th>
                                <th>Target</th>
                                <th>Cashed Out</th>
                              </tr>
                            </thead>
                            <tbody>
                              {liveBets.bots.map((p: any, i: number) => (
                                <tr key={i}>
                                  <td>{p.name}</td>
                                  <td>₹{Number(p.betAmount).toFixed(2)}</td>
                                  <td>{Number(p.target).toFixed(2)}x</td>
                                  <td>
                                    {p.cashouted ? `${Number(p.cashOut).toFixed(2)}x` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Game Results */}
          {tab === "results" && (
            <div className="results-section">
              <div className="section-header">
                <h2>
                  <span className="header-icon">
                    <Icons.TrendingUp size={18} />
                  </span>
                  Last 20 Game Results
                </h2>
                <button className="refresh-btn" onClick={fetchResults}>
                  <Icons.RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="detail-card">
                {results.length === 0 ? (
                  <p className="no-data">No results yet</p>
                ) : (
                  <div className="results-grid">
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className={`result-item ${
                          r.crashPoint < 2 ? "red" : r.crashPoint >= 5 ? "green" : "blue"
                        }`}
                      >
                        <span className="crash-val">{r.crashPoint.toFixed(2)}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Users */}
          {tab === "users" && (
            <div className="users-section">
              <div className="section-header">
                <h2>
                  <span className="header-icon">
                    <Icons.Users size={18} />
                  </span>
                  All Users ({users.length})
                </h2>
                <button className="refresh-btn" onClick={fetchUsers}>
                  <Icons.RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
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
                      <tr>
                        <td colSpan={6} className="no-data">
                          No users registered yet
                        </td>
                      </tr>
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
                              <button
                                className="view-btn"
                                onClick={() => fetchUserDetails(user.id)}
                              >
                                <Icons.Eye size={12} />
                                <span>View</span>
                              </button>
                              {addMoneyUser === String(user.id) ? (
                                <div className="add-money-inline">
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={addMoneyAmount}
                                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                                  />
                                  <button
                                    className="confirm-btn"
                                    onClick={() => handleAddMoney(user.id)}
                                  >
                                    <Icons.Check size={12} />
                                  </button>
                                  <button
                                    className="cancel-btn"
                                    onClick={() => setAddMoneyUser("")}
                                  >
                                    <Icons.X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="add-btn"
                                  onClick={() => setAddMoneyUser(String(user.id))}
                                >
                                  <Icons.Plus size={12} />
                                  <span>Add</span>
                                </button>
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
                <h2>
                  <span className="header-icon">
                    <Icons.DollarSign size={18} />
                  </span>
                  Deposit Requests
                </h2>
                <button className="refresh-btn" onClick={fetchDeposits}>
                  <Icons.RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
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
                      <tr>
                        <td colSpan={6} className="no-data">
                          No deposit requests
                        </td>
                      </tr>
                    ) : (
                      deposits.map((txn) => (
                        <tr key={txn.id}>
                          <td>{txn.username}</td>
                          <td className="amount">₹{txn.amount}</td>
                          <td>{txn.utrNumber || "-"}</td>
                          <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${txn.status}`}>{txn.status}</span>
                          </td>
                          <td>
                            {txn.status === "pending" ? (
                              <div className="action-btns">
                                <button
                                  className="approve-btn"
                                  onClick={() => handleDepositAction(txn.id, "approve")}
                                >
                                  <Icons.Check size={12} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() => handleDepositAction(txn.id, "reject")}
                                >
                                  <Icons.X size={12} />
                                  <span>Reject</span>
                                </button>
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
                <h2>
                  <span className="header-icon">
                    <Icons.CreditCard size={18} />
                  </span>
                  Withdrawal Requests
                </h2>
                <button className="refresh-btn" onClick={fetchWithdrawals}>
                  <Icons.RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
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
                      <tr>
                        <td colSpan={5} className="no-data">
                          No withdrawal requests
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((txn) => (
                        <tr key={txn.id}>
                          <td>{txn.username}</td>
                          <td className="amount">₹{txn.amount}</td>
                          <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${txn.status}`}>{txn.status}</span>
                          </td>
                          <td>
                            {txn.status === "pending" ? (
                              <div className="action-btns">
                                <button
                                  className="approve-btn"
                                  onClick={() => handleWithdrawalAction(txn.id, "approve")}
                                >
                                  <Icons.Check size={12} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() => handleWithdrawalAction(txn.id, "reject")}
                                >
                                  <Icons.X size={12} />
                                  <span>Reject</span>
                                </button>
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
              <h2 className="section-title">Payment Settings</h2>
              <p className="desc">Configure UPI ID and QR code shown on the deposit page.</p>
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
                      <Icons.Upload size={16} />
                      <span>Upload QR Image from Gallery</span>
                    </label>
                    {settings.qrImageUrl && (
                      <div className="qr-preview">
                        <img
                          src={
                            /^https?:\/\//i.test(settings.qrImageUrl)
                              ? settings.qrImageUrl
                              : `${(process.env.REACT_APP_API_URL || "").replace(/\/$/, "")}${settings.qrImageUrl}`
                          }
                          alt="QR Preview"
                        />
                        <button
                          type="button"
                          className="qr-remove-btn"
                          onClick={() => setSettings({ ...settings, qrImageUrl: "" })}
                        >
                          <Icons.X size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button className="save-btn" onClick={handleSaveSettings}>
                  <Icons.Save size={14} />
                  <span>Save Settings</span>
                </button>
              </div>

              {/* Deposit page preview — what users will see */}
              <h2 className="section-title" style={{ marginTop: 28 }}>User Deposit Preview</h2>
              <p className="desc">This is how the deposit screen will look to your users.</p>
              <div className="deposit-preview-card">
                <div className="dp-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5a3500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v6" />
                    <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
                    <circle cx="17" cy="14" r="1.5" fill="#5a3500" />
                  </svg>
                </div>
                <div className="dp-title">Deposit Funds</div>
                <div className="dp-subtitle">Load points securely to your wallet</div>
                <div className="dp-qr-wrap">
                  {settings.qrImageUrl ? (
                    <img
                      src={
                        /^https?:\/\//i.test(settings.qrImageUrl)
                          ? settings.qrImageUrl
                          : `${(process.env.REACT_APP_API_URL || "").replace(/\/$/, "")}${settings.qrImageUrl}`
                      }
                      alt="QR Preview"
                    />
                  ) : (
                    <div className="dp-qr-placeholder">No QR uploaded yet</div>
                  )}
                </div>
                <div className="dp-upi">
                  <span className="dp-upi-label">UPI ID:</span>
                  <span className="dp-upi-value">{settings.upiId || "Not set"}</span>
                </div>
              </div>
            </div>
          )}

          {/* All Bets History */}
          {tab === "allbets" && (
            <div className="transactions-section">
              <div className="section-header">
                <h2>
                  <span className="header-icon">
                    <Icons.ListChecks size={18} />
                  </span>
                  All Bets History ({allBets.length})
                </h2>
                <button className="refresh-btn" onClick={fetchAllBets}>
                  <Icons.RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
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
                      <tr>
                        <td colSpan={7} className="no-data">
                          No bets yet
                        </td>
                      </tr>
                    ) : (
                      allBets.map((bet, i) => (
                        <tr key={bet._id}>
                          <td>{allBets.length - i}</td>
                          <td>{bet.name}</td>
                          <td>
                            {new Date(bet.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>₹{Number(bet.betAmount).toFixed(2)}</td>
                          <td>{bet.cashouted ? `${Number(bet.cashoutAt).toFixed(2)}x` : "—"}</td>
                          <td>
                            {bet.cashouted ? (
                              <span className="status-badge approved">Win</span>
                            ) : (
                              <span className="status-badge rejected">Lose</span>
                            )}
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
                    <h2>
                      <span className="header-icon">
                        <Icons.User size={18} />
                      </span>
                      User #{userDetails.user.id} — {userDetails.user.username}
                    </h2>
                    <div className="action-btns">
                      <button
                        className="refresh-btn"
                        onClick={() => fetchUserDetails(userDetails.user.id)}
                      >
                        <Icons.RefreshCw size={14} />
                        <span>Refresh</span>
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleDeleteUser(userDetails.user.id)}
                      >
                        <Icons.Trash2 size={12} />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="detail-card">
                    <h3>
                      <span className="header-icon">
                        <Icons.User size={16} />
                      </span>
                      User Info
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-row">
                        <span className="detail-label">ID</span>
                        <span className="detail-val">{userDetails.user.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Username</span>
                        <span className="detail-val">{userDetails.user.username}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Name</span>
                        <span className="detail-val">{userDetails.user.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone</span>
                        <span className="detail-val">{userDetails.user.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Balance</span>
                        <span className="detail-val green">
                          ₹{Number(userDetails.user.balance).toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Joined</span>
                        <span className="detail-val">
                          {new Date(userDetails.user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Money Actions */}
                  <div className="detail-card">
                    <h3>
                      <span className="header-icon">
                        <Icons.DollarSign size={16} />
                      </span>
                      Money Actions
                    </h3>
                    <div className="money-actions-row">
                      <div className="money-action-group">
                        <label>Add Money</label>
                        <div className="add-money-inline">
                          {addMoneyUser === String(userDetails.user.id) ? (
                            <>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={addMoneyAmount}
                                onChange={(e) => setAddMoneyAmount(e.target.value)}
                              />
                              <button
                                className="confirm-btn"
                                onClick={() => {
                                  handleAddMoney(userDetails.user.id);
                                  setAddMoneyUser("");
                                }}
                              >
                                <Icons.Check size={12} />
                                <span>Add</span>
                              </button>
                              <button
                                className="cancel-btn"
                                onClick={() => setAddMoneyUser("")}
                              >
                                <Icons.X size={12} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="add-btn"
                              onClick={() => setAddMoneyUser(String(userDetails.user.id))}
                            >
                              <Icons.Plus size={12} />
                              <span>Add Money</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="money-action-group">
                        <label>Remove Money</label>
                        <div className="add-money-inline">
                          {removeMoneyUser === String(userDetails.user.id) ? (
                            <>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={removeMoneyAmount}
                                onChange={(e) => setRemoveMoneyAmount(e.target.value)}
                              />
                              <button
                                className="confirm-btn"
                                style={{ background: "#e63946" }}
                                onClick={() => handleRemoveMoney(userDetails.user.id)}
                              >
                                <Icons.Check size={12} />
                                <span>Remove</span>
                              </button>
                              <button
                                className="cancel-btn"
                                onClick={() => setRemoveMoneyUser("")}
                              >
                                <Icons.X size={12} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="reject-btn"
                              onClick={() => setRemoveMoneyUser(String(userDetails.user.id))}
                            >
                              <Icons.Minus size={12} />
                              <span>Remove Money</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="detail-card">
                    <h3>
                      <span className="header-icon">
                        <Icons.CreditCard size={16} />
                      </span>
                      Bank Details
                    </h3>
                    {!userDetails.bank ? (
                      <p className="no-data">No bank details added</p>
                    ) : (
                      <div className="detail-grid">
                        <div className="detail-row">
                          <span className="detail-label">Account Holder</span>
                          <span className="detail-val">{userDetails.bank.account_holder}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Account Number</span>
                          <span className="detail-val">{userDetails.bank.account_number}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">IFSC Code</span>
                          <span className="detail-val">{userDetails.bank.ifsc_code}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Bank Name</span>
                          <span className="detail-val">{userDetails.bank.bank_name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">UPI ID</span>
                          <span className="detail-val">{userDetails.bank.upi_id || "—"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bet History */}
                  <div className="detail-card">
                    <h3>
                      <span className="header-icon">
                        <Icons.ListChecks size={16} />
                      </span>
                      Last 20 Bets
                    </h3>
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
                                <td>
                                  {bet.cashouted ? (
                                    <span className="status-badge approved">Yes</span>
                                  ) : (
                                    <span className="status-badge rejected">No</span>
                                  )}
                                </td>
                                <td className={Number(bet.profit) >= 0 ? "green" : "red"}>
                                  ₹{Number(bet.profit).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Transaction History */}
                  <div className="detail-card">
                    <h3>
                      <span className="header-icon">
                        <Icons.DollarSign size={16} />
                      </span>
                      Transaction History
                    </h3>
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
                                <td>
                                  <span className={`status-badge ${txn.status}`}>
                                    {txn.status}
                                  </span>
                                </td>
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
