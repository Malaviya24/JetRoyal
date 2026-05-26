import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import logo from "../assets/images/jetroyal-logo.svg";
import "./auth.scss";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read referral code from ?ref=XXX (or ?referral=XXX). When present,
  // the field is locked so the user can't accidentally remove it.
  const refFromUrl = (searchParams.get("ref") || searchParams.get("referral") || "").toUpperCase().trim();

  const [form, setForm] = useState({
    username: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: refFromUrl,
  });
  const [refLocked, setRefLocked] = useState(!!refFromUrl);
  const [refValidated, setRefValidated] = useState<{ valid: boolean; name?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Validate the referral code once when prefilled from the URL
  useEffect(() => {
    if (!refFromUrl) return;
    fetch(`${config.api}/referral/validate/${encodeURIComponent(refFromUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.valid) setRefValidated({ valid: true, name: d.referrerName });
        else setRefValidated({ valid: false });
      })
      .catch(() => {});
  }, [refFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "referralCode") {
      setForm({ ...form, referralCode: value.toUpperCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.api}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Registration successful!");
        // Full reload to ensure Unity initializes fresh
        setTimeout(() => { window.location.href = "/"; }, 500);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img src={logo} alt="JetRoyal" className="auth-logo-img" />
          <h1>Create Account</h1>
          <p>Register to start playing</p>
          {refLocked && refValidated && (
            <p style={{ marginTop: 6, color: refValidated.valid ? "#28a909" : "#e63946", fontWeight: 600 }}>
              {refValidated.valid
                ? `Referred by ${refValidated.name}`
                : "Invalid referral link"}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              required
              minLength={10}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create password (min 6 chars)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Referral Code <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              value={form.referralCode}
              onChange={handleChange}
              readOnly={refLocked}
              style={refLocked ? { background: "#1a1a1a", opacity: 0.85, cursor: "not-allowed" } : undefined}
              maxLength={12}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "REGISTER"}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
