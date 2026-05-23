import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import "./auth.scss";

export default function Deposit() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState("aviator@upi");
  const [qrImageUrl, setQrImageUrl] = useState("");

  const token = localStorage.getItem("token");

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${config.api}/user/deposit`, {
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
      toast.error("Server error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <button className="page-back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
      <div className="auth-container dashboard-container">
        <div className="auth-header">
          <h1>💰 Deposit</h1>
          <p>Add funds to your account</p>
        </div>

        <div className="info-box">
          <p>📱 Send payment via UPI/Bank Transfer</p>
          <p className="upi-id">UPI: <strong>{upiId}</strong></p>
          {qrImageUrl && (
            <div style={{ margin: "12px 0" }}>
              <img src={qrImageUrl} alt="QR Code" style={{ maxWidth: "180px", borderRadius: "8px" }} />
            </div>
          )}
          <p className="note">After payment, enter the UTR number below</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              placeholder="Minimum ₹100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={100}
              required
            />
            <div className="quick-amounts">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`quick-btn ${amount === String(amt) ? "active" : ""}`}
                  onClick={() => setAmount(String(amt))}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
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
          <button type="submit" className="auth-btn deposit-btn" disabled={loading}>
            {loading ? "Processing..." : "SUBMIT DEPOSIT"}
          </button>
        </form>

        <div className="auth-footer">
          <button className="back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
        </div>
      </div>
    </div>
  );
}
