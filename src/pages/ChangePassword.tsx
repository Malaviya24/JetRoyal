import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import "./auth.scss";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }

    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.api}/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password");
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
          <h1>🔒 Change Password</h1>
          <p>Update your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Enter current password"
              value={form.oldPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password (min 6 chars)"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm new password"
              value={form.confirmNewPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Updating..." : "CHANGE PASSWORD"}
          </button>
        </form>

        <div className="auth-footer">
          <button className="back-btn" onClick={() => navigate("/account")}>← Back to Account</button>
        </div>
      </div>
    </div>
  );
}
