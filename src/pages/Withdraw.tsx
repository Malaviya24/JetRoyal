import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

const QUICK = [500, 1000, 5000, 10000];

export default function Withdraw() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [hasBank, setHasBank] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authFetch(`${config.api}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBalance(data.user.balance);
    } catch (e) {}
  }, [token]);

  const checkBank = useCallback(async () => {
    try {
      const res = await authFetch(`${config.api}/user/bank-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.bank) setHasBank(true);
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
    checkBank();
  }, [token, navigate, fetchProfile, checkBank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    if (!hasBank) {
      toast.error("Please add bank details first");
      navigate("/account/bank");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`${config.api}/user/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setBalance(data.balance);
        setAmount("");
      } else {
        toast.error(data.error || "Withdrawal failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
    setLoading(false);
  };

  return (
    <PageShell
      title="Withdraw"
      subtitle="Transfer your winnings to your bank account."
      icon={<Icons.ArrowUpFromLine size={20} />}
      back="/account"
    >
      <div className="ps-panel">
        <div className="ps-panel-icon"><Icons.Wallet size={16} /></div>
        <div className="ps-panel-body">
          <div className="ps-panel-title">Available balance</div>
          <div className="ps-panel-text">
            <span style={{ fontSize: 20, fontWeight: 700, color: "#28a909" }}>
              ₹{balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {!hasBank && (
        <div className="ps-panel warn">
          <div className="ps-panel-icon"><Icons.AlertTriangle size={16} /></div>
          <div className="ps-panel-body">
            <div className="ps-panel-title">Bank details required</div>
            <div className="ps-panel-text">
              Add your bank account before requesting a withdrawal.{" "}
              <button
                type="button"
                onClick={() => navigate("/account/bank")}
                style={{ background: "none", border: "none", color: "#e69308", cursor: "pointer", padding: 0, fontWeight: 600, textDecoration: "underline" }}
              >
                Add now →
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="ps-form" onSubmit={handleSubmit}>
        <div className="ps-field">
          <label>Withdrawal Amount (₹)</label>
          <input
            type="number"
            placeholder="Minimum ₹100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={100}
            max={balance}
            required
          />
          <span className="ps-helper">Minimum ₹100. Processed in 1–24 hours.</span>
        </div>

        <div className="ps-chips">
          {QUICK.map((q) => (
            <button
              type="button"
              key={q}
              className={`ps-chip ${Number(amount) === q ? "active" : ""}`}
              onClick={() => setAmount(String(Math.min(q, balance)))}
              disabled={q > balance}
            >
              ₹{q.toLocaleString()}
            </button>
          ))}
        </div>

        <button type="submit" className="ps-btn ps-block" disabled={loading || !hasBank}>
          {loading ? "Processing..." : "Request Withdrawal"}
        </button>
      </form>
    </PageShell>
  );
}
