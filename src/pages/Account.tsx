import React from "react";
import { useNavigate } from "react-router-dom";
import "./auth.scss";

export default function Account() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <button className="page-back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
      <div className="auth-container dashboard-container">
        <div className="auth-header">
          <h1>👤 My Account</h1>
          <p>Welcome, {user.name || user.username}</p>
        </div>

        <div className="account-info">
          <div className="account-row">
            <span>Username:</span>
            <strong>{user.username}</strong>
          </div>
          <div className="account-row">
            <span>Phone:</span>
            <strong>{user.phone}</strong>
          </div>
        </div>

        <div className="menu-list">
          <button className="menu-item" onClick={() => navigate("/account/password")}>
            <span className="menu-icon">🔒</span>
            <span className="menu-text">Change Password</span>
            <span className="menu-arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => navigate("/account/bank")}>
            <span className="menu-icon">🏦</span>
            <span className="menu-text">Bank Details</span>
            <span className="menu-arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => navigate("/deposit")}>
            <span className="menu-icon">💰</span>
            <span className="menu-text">Deposit</span>
            <span className="menu-arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => navigate("/withdraw")}>
            <span className="menu-icon">🏧</span>
            <span className="menu-text">Withdraw</span>
            <span className="menu-arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => navigate("/referrals")}>
            <span className="menu-icon">🎁</span>
            <span className="menu-text">Refer & Earn</span>
            <span className="menu-arrow">→</span>
          </button>
          <button className="menu-item logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span className="menu-text">Logout</span>
            <span className="menu-arrow">→</span>
          </button>
        </div>

        <div className="auth-footer">
          <button className="back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
        </div>
      </div>
    </div>
  );
}
