import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import logo from "../assets/images/aviator-logo.png";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import { queueInstallPrompt } from "../components/InstallPrompt";
import "../components/page-shell.scss";

export default function Register() {
  const [searchParams] = useSearchParams();
  const refFromUrl = (searchParams.get("ref") || searchParams.get("referral") || "").toUpperCase().trim();

  const [form, setForm] = useState({
    username: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: refFromUrl,
  });
  const [refLocked] = useState(!!refFromUrl);
  const [refValidated, setRefValidated] = useState<{ valid: boolean; name?: string } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!refFromUrl) return;
    fetch(`${config.api}/referral/validate/${encodeURIComponent(refFromUrl)}`)
      .then((r) => r.json())
      .then((d) => setRefValidated(d && d.valid ? { valid: true, name: d.referrerName } : { valid: false }))
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
        queueInstallPrompt();
        toast.success("Account created. Welcome aboard!");
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
    <PageShell
      title="Create your account"
      subtitle="Join Aviator and start playing in seconds."
      icon={<Icons.User size={20} />}
      back={() => { window.location.href = "/"; }}
    >
      <div className="ps-auth">
        <img src={logo} alt="Aviator" className="ps-auth-logo" />
      </div>

      {refLocked && refValidated && (
        <div className={`ps-panel ${refValidated.valid ? "" : "danger"}`}>
          <div className="ps-panel-icon">
            {refValidated.valid ? <Icons.Check size={16} /> : <Icons.AlertTriangle size={16} />}
          </div>
          <div className="ps-panel-body">
            <div className="ps-panel-title">
              {refValidated.valid ? `Referred by ${refValidated.name}` : "Invalid referral link"}
            </div>
            <div className="ps-panel-text">
              {refValidated.valid
                ? "You'll both earn a bonus on the first qualifying deposit."
                : "The code in this link doesn't exist. You can still register without one."}
            </div>
          </div>
        </div>
      )}

      <form className="ps-form" onSubmit={handleSubmit}>
        <div className="ps-field">
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            autoComplete="username"
          />
        </div>

        <div className="ps-field">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div className="ps-field">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="10-digit phone number"
            value={form.phone}
            onChange={handleChange}
            required
            minLength={10}
            autoComplete="tel"
          />
        </div>

        <div className="ps-field">
          <label>Password</label>
          <div className="ps-row-flex">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              className="ps-grow"
            />
            <button
              type="button"
              className="ps-btn ps-ghost ps-sm"
              onClick={() => setShowPass(!showPass)}
              style={{ padding: "10px 12px" }}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="ps-field">
          <label>Confirm Password</label>
          <input
            type={showPass ? "text" : "password"}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="ps-field">
          <label>Referral Code <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
          <input
            type="text"
            name="referralCode"
            placeholder="Enter referral code"
            value={form.referralCode}
            onChange={handleChange}
            readOnly={refLocked}
            maxLength={12}
          />
        </div>

        <button type="submit" className="ps-btn ps-block" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="ps-divider" />

      <p className="ps-text-muted" style={{ textAlign: "center" }}>
        Already have an account? <Link to="/login" className="ps-text-gold" style={{ textDecoration: "none" }}>Sign in</Link>
      </p>
    </PageShell>
  );
}
