import React from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/images/aviator-logo.png";
import "../index.scss";
import Context from "../context";
import { InstallAppMenuButton } from "./InstallPrompt";

export default function Header() {
  const { state } = React.useContext(Context)
  const navigate = useNavigate();

  const [howto, setHowto] = React.useState<'howto' | 'short' | 'more' | ''>("howto");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="header flex-none items-center">
      <div className="header-container">
        <div className="header-left">
          {isLoggedIn && (
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <rect y="0" width="20" height="2.5" rx="1.25" fill="#fff"/>
                <rect y="6.75" width="20" height="2.5" rx="1.25" fill="#fff"/>
                <rect y="13.5" width="20" height="2.5" rx="1.25" fill="#fff"/>
              </svg>
            </button>
          )}
          <div
            className="logo-container"
            onClick={() => { window.location.href = "/"; }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") window.location.href = "/"; }}
          >
            <img src={logo} alt="logo" className="logo"></img>
          </div>
        </div>
        <div className="second-block">
          <button className="howto" onClick={() => setHowto("short")}>
            <div className="help-logo"></div>
            <div className="help-msg">How to play ?</div>
          </button>
          {isLoggedIn ? (
            <div className="d-flex">
              <div
                className="balance"
                onClick={() => navigate("/deposit")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/deposit"); }}
                title="Click to deposit"
              >
                <span className="balance-coin" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="url(#coinGrad)" stroke="#b46e00" strokeWidth="1" />
                    <text x="12" y="16" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5a3500" fontFamily="Arial, sans-serif">$</text>
                    <defs>
                      <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#e69308" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span className="amount">{Number(state.userInfo.balance).toFixed(2)} </span>
                <span className="currency">&nbsp;INR</span>
              </div>
            </div>
          ) : (
            <div className="d-flex" style={{ gap: '6px' }}>
              <button className="auth-header-btn login-btn" onClick={() => window.location.href = "/login"}>Login</button>
              <button className="auth-header-btn register-btn" onClick={() => window.location.href = "/register"}>Register</button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-user">
            <img src={state.userInfo.img || "/avatars/av-12.png"} alt="avatar" className="sidebar-avatar" />
            <div className="sidebar-user-info">
              <span className="sidebar-username">{state.userInfo.userName || "Guest"}</span>
              <span className="sidebar-balance">₹{Number(state.userInfo.balance).toFixed(2)}</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="sidebar-menu">
          <button onClick={() => { setSidebarOpen(false); navigate("/game"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28a909" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
            <span>Game</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/deposit"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28a909" strokeWidth="2"><path d="M12 2v20M17 7H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            <span>Deposit</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/withdraw"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e69308" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            <span>Withdraw</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/account"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34b4ff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Account</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/account/bank"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg>
            <span>Bank Details</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/bet-history"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e69308" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            <span>Bet History</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/transactions"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34b4ff" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span>Transactions</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); navigate("/referrals"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e69308" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            <span>Refer &amp; Earn</span>
          </button>
          <InstallAppMenuButton onClick={() => setSidebarOpen(false)} />
          <div className="sidebar-divider"></div>
          <button className="logout-item" onClick={() => { setSidebarOpen(false); localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* How to Play - Short */}
      {howto === "short" && <div className="modal">
        <div className="back" onClick={() => setHowto("howto")}></div>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header modal-bg text-uppercase">
              <span>How to Play?</span>
              <button onClick={() => setHowto('')} className="close modal-close">
                <span>×</span>
              </button>
            </div>
            <div className="modal-body m-body-bg">
              <div className="step">
                <div className="bullet">01</div>
                <p>Place your bet before the round starts. You can place one or two bets at the same time.</p>
              </div>
              <div className="step">
                <div className="bullet bullet-2">02</div>
                <p>Watch the plane take off and the multiplier increase. Your win is your bet multiplied by the current multiplier.</p>
              </div>
              <div className="step">
                <div className="bullet bullet-3">03</div>
                <p>Cash out before the plane flies away! If you don't cash out in time, you lose your bet.</p>
              </div>
            </div>
            <div className="modal-footer m-f-bg">
              <button onClick={() => setHowto("more")}>
                detailed rules
              </button>
            </div>
          </div>
        </div>
      </div>}

      {/* How to Play - Detailed */}
      {howto === "more" && <div className="modal">
        <div className="back" onClick={() => setHowto("howto")}></div>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <span className="text-uppercase">Game Rules</span>
              <button onClick={() => setHowto("howto")} className="close">
                <span>×</span>
              </button>
            </div>
            <div className="modal-body p-1r">
              <p className="text-gray">
                Aviator is a new generation of online gaming. Win big in seconds! The game uses a provably fair system ensuring complete transparency.
              </p>
              <div className="rules-list pt-2">
                <div className="rules-list-title">How It Works</div>
                <ul className="list-group">
                  <li className="list-group-item">The multiplier starts at 1.00x and increases as the plane flies higher.</li>
                  <li className="list-group-item">Your winnings = your bet amount × the multiplier when you cash out.</li>
                  <li className="list-group-item">The plane can fly away at any moment. If it flies away before you cash out, you lose your bet.</li>
                </ul>
              </div>
              <div className="rules-list pt-2">
                <div className="rules-list-title">Placing Bets</div>
                <ul className="list-group">
                  <li className="list-group-item">Select your bet amount and press "BET" during the waiting phase.</li>
                  <li className="list-group-item">You can place two bets at the same time using the second bet panel.</li>
                  <li className="list-group-item">Press "CASHOUT" while the plane is flying to collect your winnings.</li>
                </ul>
              </div>
              <div className="rules-list pt-2">
                <div className="rules-list-title">Auto Play</div>
                <ul className="list-group">
                  <li className="list-group-item">Switch to "Auto" tab to enable automatic betting.</li>
                  <li className="list-group-item">Set the number of rounds and stop conditions.</li>
                  <li className="list-group-item">Enable "Auto Cash Out" to automatically cash out at a specific multiplier.</li>
                </ul>
              </div>
              <div className="rules-list pt-2">
                <div className="rules-list-title">Important</div>
                <ul className="list-group">
                  <li className="list-group-item">Minimum bet: ₹1 | Maximum bet: ₹10,000</li>
                  <li className="list-group-item">If your connection drops during a bet, the game will auto cash out at the current multiplier.</li>
                  <li className="list-group-item">Each round result is provably fair and cannot be manipulated.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
