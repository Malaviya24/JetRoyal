import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import "./auth.scss";
import "./referrals.scss";

interface ReferralRow {
  userId: number;
  username: string;
  name: string;
  createdAt: string;
  bonusPaid: number;
  totalDeposited: number;
}

interface ReferralData {
  referralCode: string;
  bonusAmount: number;
  minDeposit: number;
  totalEarnings: number;
  totalReferrals: number;
  paidReferrals: number;
  referrals: ReferralRow[];
}

export default function Referrals() {
  const navigate = useNavigate();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${config.api}/user/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {}
    setLoading(false);
  };

  const referralLink = data
    ? `${window.location.origin}/register?ref=${data.referralCode}`
    : "";

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    if (!data) return;
    const text = `Join JetRoyal Aviator and we both get ₹${data.bonusAmount} bonus! Use my code ${data.referralCode} or sign up with this link:\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "JetRoyal Referral", text, url: referralLink });
        return;
      } catch (e) {
        // fall through to clipboard
      }
    }
    copy(text, "Invite message");
  };

  return (
    <div className="auth-page" style={{ alignItems: "flex-start", paddingTop: 50 }}>
      <button className="page-back-btn" onClick={() => navigate("/account")}>← Back</button>
      <div className="auth-container referrals-container">
        <div className="auth-header">
          <h1>Refer & Earn</h1>
          <p>
            {data
              ? `Get ₹${data.bonusAmount} when a friend signs up with your code and deposits ₹${data.minDeposit} or more. Both of you get the bonus.`
              : "Loading..."}
          </p>
        </div>

        {loading || !data ? (
          <p className="ref-empty">Loading referral details...</p>
        ) : (
          <>
            <div className="ref-stats">
              <div className="ref-stat">
                <span className="ref-stat-val">{data.totalReferrals}</span>
                <span className="ref-stat-label">Total Referrals</span>
              </div>
              <div className="ref-stat green">
                <span className="ref-stat-val">{data.paidReferrals}</span>
                <span className="ref-stat-label">Paid Out</span>
              </div>
              <div className="ref-stat gold">
                <span className="ref-stat-val">₹{data.totalEarnings.toLocaleString()}</span>
                <span className="ref-stat-label">Total Earnings</span>
              </div>
            </div>

            <div className="ref-block">
              <label>Your Referral Code</label>
              <div className="ref-row">
                <input value={data.referralCode} readOnly />
                <button onClick={() => copy(data.referralCode, "Code")}>Copy</button>
              </div>
            </div>

            <div className="ref-block">
              <label>Your Referral Link</label>
              <div className="ref-row">
                <input value={referralLink} readOnly />
                <button onClick={() => copy(referralLink, "Link")}>Copy</button>
              </div>
              <button className="share-btn" onClick={share}>Share Invite</button>
            </div>

            <div className="ref-block">
              <label>People you've referred</label>
              {data.referrals.length === 0 ? (
                <p className="ref-empty">No referrals yet. Share your link to get started.</p>
              ) : (
                <div className="ref-list">
                  {data.referrals.map((r) => (
                    <div key={r.userId} className={`ref-item ${r.bonusPaid ? "paid" : "pending"}`}>
                      <div className="ref-item-left">
                        <span className="ref-name">{r.username}</span>
                        <span className="ref-date">
                          Joined {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="ref-item-right">
                        <span className="ref-deposit">₹{Number(r.totalDeposited).toLocaleString()} deposited</span>
                        <span className={`ref-status ${r.bonusPaid ? "paid" : "pending"}`}>
                          {r.bonusPaid ? `Bonus paid +₹${data.bonusAmount}` : "Awaiting first deposit"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
