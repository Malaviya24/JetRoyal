import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";
import "./deposit.scss";

const QUICK = [500, 1000, 5000, 10000];

export default function Deposit() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState("aviator@upi");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${config.api}/deposit-info`);
        const data = await res.json();
        if (data.success) {
          setUpiId(data.upiId || "aviator@upi");
          setQrImageUrl(data.qrImageUrl || "");
        }
      } catch (e) {}
    })();
  }, []);

  const resolveQrUrl = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const apiOrigin = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
    if (apiOrigin) return `${apiOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
    return url;
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
      if ((err as Error)?.message !== "Unauthorized") {
        toast.error("Server error");
      }
    }
    setLoading(false);
  };

  return (
    <PageShell
      title="Deposit"
      subtitle="Add funds to your wallet via UPI."
      icon={<Icons.ArrowDownToLine size={20} />}
      back="/account"
    >
      <form className="ps-form" onSubmit={handleSubmit}>
        <div className="ps-field">
          <label>Deposit Amount (₹)</label>
          <input
            type="number"
            placeholder="Minimum ₹100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={100}
            required
          />
        </div>

        <div className="ps-chips">
          {QUICK.map((q) => (
            <button
              type="button"
              key={q}
              className={`ps-chip ${amount === String(q) ? "active" : ""}`}
              onClick={() => setAmount(String(q))}
            >
              ₹{q.toLocaleString("en-IN")}
            </button>
          ))}
        </div>

        <div className="ps-divider" />

        <div className="ps-text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Scan or Pay
        </div>

        <div className="dp-qr-card">
          {qrImageUrl ? (
            <img className="dp-qr-img" src={resolveQrUrl(qrImageUrl)} alt="UPI QR" />
          ) : (
            <div className="dp-qr-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <line x1="14" y1="14" x2="14" y2="14.01" />
                <line x1="14" y1="18" x2="18" y2="18" />
                <line x1="14" y1="21" x2="14" y2="21.01" />
                <line x1="18" y1="14" x2="21" y2="14" />
                <line x1="21" y1="18" x2="21" y2="21" />
              </svg>
              <span>QR code unavailable. Use UPI ID below.</span>
            </div>
          )}
        </div>

        <div className="ps-field">
          <label>UPI ID</label>
          <div className="ps-row-flex">
            <input value={upiId} readOnly className="ps-grow" style={{ fontFamily: "monospace" }} />
            <button type="button" className="ps-btn ps-sm" onClick={handleCopy}>
              {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <button type="button" className="ps-btn ps-ghost ps-block" onClick={handleOpenUpi}>
          <Icons.Share size={14} /> Open in UPI App
        </button>

        <div className="ps-panel">
          <div className="ps-panel-icon"><Icons.Info size={16} /></div>
          <div className="ps-panel-body">
            <div className="ps-panel-text">
              After paying, enter the UTR / reference number below. Admin will verify and credit your wallet.
            </div>
          </div>
        </div>

        <div className="ps-field">
          <label>UTR / Transaction Number</label>
          <input
            type="text"
            placeholder="Enter 12-digit UTR number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="ps-btn ps-block" disabled={loading}>
          {loading ? "Submitting..." : "Submit Deposit Request"}
        </button>
      </form>
    </PageShell>
  );
}
