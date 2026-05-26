import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/jetroyal-logo.svg";
import "./not-found.scss";

export default function NotFound() {
  const navigate = useNavigate();

  const goHome = () => {
    // Full reload so Unity (if it crashed) reinitializes cleanly
    window.location.href = "/";
  };

  return (
    <div className="nf-page">
      <div className="nf-card">
        <img src={logo} alt="JetRoyal Aviator" className="nf-logo" />
        <div className="nf-code-wrap" aria-hidden="true">
          <span className="nf-code">404</span>
          <svg className="nf-plane" width="84" height="84" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
              fill="#e63946"
              stroke="#e63946"
              strokeWidth="0.5"
            />
          </svg>
        </div>
        <h1 className="nf-title">Plane has flown off the map</h1>
        <p className="nf-text">
          The page you're looking for either crashed or never took off.
          Let's get you back to the runway.
        </p>
        <div className="nf-actions">
          <button className="nf-btn primary" onClick={goHome}>
            Go to Home
          </button>
          <button className="nf-btn ghost" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
