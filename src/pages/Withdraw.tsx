import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import "./auth.scss";

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [hasBank, setHasBank] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
    checkBank();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch(`${config.api}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBalance(data.user.balance);
    } catch (e) {}
  };

  const checkBank = async () => {
    try {
      const res = await authFetch(`${config.api}/user/bank-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.bank) setHasBank(true);
    } catch (e) {}
  };

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
    <div className="auth-page">
      <button className="page-back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
      <div className="auth-container dashboard-container">
        <div className="auth-header">
          <h1>🏧 Withdraw</h1>
          <p>Withdraw funds to your bank</p>
        </div>

        <div className="info-box">
          <p>Available Balance: <strong className="balance-text">₹{balance.toFixed(2)}</strong></p>
          <p className="note">Minimum withdrawal: ₹100 | Processing: 1-24 hours</p>
        </div>

        {!hasBank && (
          <div className="warning-box">
            <p>⚠️ Please add your bank details before withdrawing</p>
            <button className="link-btn" onClick={() => navigate("/account/bank")}>Add Bank Details →</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
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
          </div>
          <button type="submit" className="auth-btn withdraw-btn" disabled={loading || !hasBank}>
            {loading ? "Processing..." : "WITHDRAW"}
          </button>
        </form>

        <div className="auth-footer">
          <button className="back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
        </div>
      </div>
    </div>
  );
}
