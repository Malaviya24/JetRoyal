import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/aviator-logo.png";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

export default function NotFound() {
  const navigate = useNavigate();

  const goHome = () => {
    // Full reload so Unity (if it crashed) reinitializes cleanly
    window.location.href = "/";
  };

  return (
    <PageShell
      title="Page not found"
      subtitle="The page you're looking for doesn't exist or has been moved."
      icon={<Icons.AlertTriangle size={20} />}
      back={() => navigate(-1)}
    >
      <div className="ps-auth">
        <img src={logo} alt="Aviator" className="ps-auth-logo" />
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: -2,
            color: "#e69308",
            lineHeight: 1,
            margin: "8px 0 6px",
            textShadow: "0 6px 24px rgba(230, 147, 8, 0.25)",
          }}
        >
          404
        </div>
        <p className="ps-text-muted" style={{ margin: 0, fontSize: 14 }}>
          Looks like the plane already flew off this route.
        </p>
      </div>

      <div className="ps-divider" />

      <div className="ps-row-flex" style={{ gap: 10 }}>
        <button className="ps-btn ps-block" onClick={goHome}>
          <Icons.Home size={16} /> Go to Home
        </button>
        <button className="ps-btn ps-ghost ps-block" onClick={() => navigate(-1)}>
          <Icons.ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </PageShell>
  );
}
