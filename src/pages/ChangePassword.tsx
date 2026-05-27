import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

export default function ChangePassword() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const res = await authFetch(`${config.api}/user/change-password`, {
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
    <PageShell
      title="Change Password"
      subtitle="Use a strong password and don't reuse it elsewhere."
      icon={<Icons.Lock size={20} />}
      back="/account"
    >
      <form className="ps-form" onSubmit={handleSubmit}>
        <div className="ps-field">
          <label>Current Password</label>
          <input
            type={showPass ? "text" : "password"}
            name="oldPassword"
            placeholder="Enter current password"
            value={form.oldPassword}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="ps-field">
          <label>New Password</label>
          <input
            type={showPass ? "text" : "password"}
            name="newPassword"
            placeholder="Minimum 6 characters"
            value={form.newPassword}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="ps-field">
          <label>Confirm New Password</label>
          <input
            type={showPass ? "text" : "password"}
            name="confirmNewPassword"
            placeholder="Re-enter new password"
            value={form.confirmNewPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <label className="ps-text-muted" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showPass}
            onChange={(e) => setShowPass(e.target.checked)}
            style={{ accentColor: "#e69308" }}
          />
          Show passwords
        </label>

        <button type="submit" className="ps-btn ps-block" disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </PageShell>
  );
}
