import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import "./deposit.scss";

// =====================================================
// Inline SVG icons (Lucide-style stroke icons)
// =====================================================
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icons = {
  ArrowLeft: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Wallet: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v6" />
      <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" />
    </svg>
  ),
  Bolt: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Shield: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Copy: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ExternalLink: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Chat: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  QrPlaceholder: ({ size = 56 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.5}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="14" y2="14.01" />
      <line x1="14" y1="18" x2="18" y2="18" />
      <line x1="14" y1="21" x2="14" y2="21.01" />
      <line x1="18" y1="14" x2="21" y2="14" />
      <line x1="21" y1="18" x2="21" y2="21" />
    </svg>
  ),
};

export default function Deposit() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState("aviator@upi");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem("token");
  const quickAmounts = [500, 1000, 5000, 10000];

  useEffect(() => {
    fetchDepositInfo();
  }, []);

  const fetchDepositInfo = async () => {
    try {
      const res = await fetch(`${config.api}/deposit-info`);
      const data = await res.json();
      if (data.success) {
        setUpiId(data.upiId || "aviator@upi");
        setQrImageUrl(data.qrImageUrl || "");
      }
    } catch (e) {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success("UPI ID copied");
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      toast.error("Could not copy");
    }
  };

  const handleOpenUpi = () => {
    const amt = Number(amount) || 0;
    const uri =
      `upi://pay?pa=${encodeURIComponent(upiId)}` +
      `&pn=${encodeURIComponent("JetRoyal Aviator")}` +
      (amt > 0 ? `&am=${amt}` : "") +
      `&cu=INR`;
    window.location.href = uri;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }

    setLoading(true);
    try {
      const res = await authFetch(`${config.api}/user/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), utrNumber }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setAmount("");
        setUtrNumber("");
      } else {
        toast.error(data.error || "Deposit failed");
      }
    } catch (err) {
      // authFetch already handles 401 → redirect; only generic errors land here
      if ((err as Error)?.message !== "Unauthorized") {
        toast.error("Server error");
      }
    }
    setLoading(false);
  };

  // Resolve QR URL — if relative ("/api/uploads/..." or "/uploads/...") prefix with API origin
  const resolveQrUrl = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const apiOrigin = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
    if (apiOrigin) return `${apiOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
    return url;
  };

  return (
    <div className="deposit-page">
      <div className="deposit-card">
        <button className="back-pill" onClick={() => navigate("/game")}>
          <Icons.ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="deposit-icon" aria-hidden="true">
          <Icons.Wallet size={30} />
        </div>

        <h1 className="deposit-title">Deposit Funds</h1>
        <p className="deposit-subtitle">Load points securely to your wallet</p>

        <div className="badge-row">
          <span className="badge badge-gold">
            <Icons.Bolt size={12} />
            <span>Faster Processing (5m)</span>
          </span>
          <span className="badge badge-green">
            <Icons.Shield size={12} />
            <span>100% Secured</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="deposit-form">
          <div className="field-block">
            <label className="field-label">Enter Deposit Amount (₹)</label>
            <input
              className="amount-input"
              type="number"
              placeholder="₹500 — ₹50,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={100}
              required
            />
            <div className="quick-chips">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`chip ${amount === String(amt) ? "active" : ""}`}
                  onClick={() => setAmount(String(amt))}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <label className="field-label">Scan QR &amp; Pay</label>
            <div className="qr-card">
              {qrImageUrl ? (
                <img className="qr-img" src={resolveQrUrl(qrImageUrl)} alt="UPI QR" />
              ) : (
                <div className="qr-placeholder">
                  <Icons.QrPlaceholder size={56} />
                  <span>QR code will be available soon</span>
                </div>
              )}
            </div>

            <div className="upi-row">
              <div className="upi-text">
                <span className="upi-label">UPI ID:</span>
                <span className="upi-value">{upiId}</span>
              </div>
              <button type="button" className="copy-btn" onClick={handleCopy}>
                {copied ? <Icons.Check size={12} /> : <Icons.Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <button type="button" className="upi-open-btn" onClick={handleOpenUpi}>
              <Icons.ExternalLink size={14} />
              <span>Open UPI App</span>
            </button>

            <p className="note-text">
              After payment, enter your UTR / transaction number below.
              Admin will verify and approve your wallet balance.
            </p>
          </div>

          <div className="field-block">
            <label className="field-label">UTR / Transaction Number</label>
            <input
              className="utr-input"
              type="text"
              placeholder="Enter 12-digit UTR number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <span>{loading ? "Processing..." : "Submit Deposit Request"}</span>
            {!loading && <Icons.Check size={16} />}
          </button>
        </form>

        <div className="support-row">
          <span className="support-text">Need assistance with deposit?</span>
          <a
            className="support-btn"
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.Chat size={14} />
            <span>Chat with Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
