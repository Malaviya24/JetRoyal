import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import logo from "../assets/images/aviator-logo.png";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${config.api}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back!");
        setTimeout(() => { window.location.href = "/"; }, 400);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <PageShell
      title="Sign in to Aviator"
      subtitle="Welcome back. Log in to continue playing."
      icon={<Icons.User size={20} />}
      back={() => { window.location.href = "/"; }}
    >
      <div className="ps-auth">
        <img src={logo} alt="Aviator" className="ps-auth-logo" />
      </div>

      <form className="ps-form" onSubmit={handleSubmit}>
        <div className="ps-field">
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="ps-field">
          <label>Password</label>
          <div className="ps-row-flex">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="ps-grow"
            />
            <button
              type="button"
              className="ps-btn ps-ghost ps-sm"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? "Hide password" : "Show password"}
              style={{ padding: "10px 12px" }}
            >
              {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="ps-btn ps-block" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="ps-divider" />

      <p className="ps-text-muted" style={{ textAlign: "center" }}>
        Don't have an account? <Link to="/register" className="ps-text-gold" style={{ textDecoration: "none" }}>Create one</Link>
      </p>
    </PageShell>
  );
}
