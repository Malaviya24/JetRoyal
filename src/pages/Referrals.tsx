import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

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
  const token = localStorage.getItem("token");

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${config.api}/user/referrals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setData(json);
      } catch (e) {}
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const referralLink = data ? `${window.location.origin}/register?ref=${data.referralCode}` : "";

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
    const text = `Join JetRoyal Aviator and we both get ₹${data.bonusAmount} bonus! Use code ${data.referralCode} or this link:\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "JetRoyal Referral", text, url: referralLink });
        return;
      } catch (e) {}
    }
    copy(text, "Invite message");
  };

  return (
    <PageShell
      title="Refer & Earn"
      subtitle={
        data
          ? `Get ₹${data.bonusAmount} when a friend signs up with your code and deposits ₹${data.minDeposit}+. Both of you receive the bonus.`
          : "Loading referral details..."
      }
      icon={<Icons.Gift size={20} />}
      back="/account"
      wide
    >
      {loading || !data ? (
        <div className="ps-loading">Loading referral details...</div>
      ) : (
        <>
          <div className="ps-stats">
            <div className="ps-stat">
              <span className="v">{data.totalReferrals}</span>
              <span className="l">Total Referrals</span>
            </div>
            <div className="ps-stat green">
              <span className="v">{data.paidReferrals}</span>
              <span className="l">Bonus Paid</span>
            </div>
            <div className="ps-stat gold">
              <span className="v">₹{data.totalEarnings.toLocaleString()}</span>
              <span className="l">Total Earnings</span>
            </div>
          </div>

          <div className="ps-field">
            <label>Your Referral Code</label>
            <div className="ps-row-flex">
              <input value={data.referralCode} readOnly className="ps-grow" style={{ fontFamily: "monospace", letterSpacing: "1px" }} />
              <button type="button" className="ps-btn ps-sm" onClick={() => copy(data.referralCode, "Code")}>
                <Icons.Copy size={14} /> Copy
              </button>
            </div>
          </div>

          <div className="ps-field">
            <label>Your Referral Link</label>
            <div className="ps-row-flex">
              <input value={referralLink} readOnly className="ps-grow" style={{ fontSize: 12 }} />
              <button type="button" className="ps-btn ps-sm" onClick={() => copy(referralLink, "Link")}>
                <Icons.Copy size={14} /> Copy
              </button>
            </div>
            <button type="button" className="ps-btn ps-ghost ps-block" onClick={share} style={{ marginTop: 10 }}>
              <Icons.Share size={14} /> Share Invite
            </button>
          </div>

          <div className="ps-divider" />

          <div style={{ marginBottom: 10 }}>
            <span className="ps-text-muted" style={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11, fontWeight: 600 }}>
              People you've referred
            </span>
          </div>

          {data.referrals.length === 0 ? (
            <div className="ps-empty">No referrals yet. Share your link to get started.</div>
          ) : (
            <div className="ps-table-wrap">
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Deposited</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((r) => (
                    <tr key={r.userId}>
                      <td>{r.username}</td>
                      <td className="ps-text-muted">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(r.totalDeposited).toLocaleString()}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`ps-pill ${r.bonusPaid ? "paid" : "pending"}`}>
                          {r.bonusPaid ? `+₹${data.bonusAmount}` : "Awaiting deposit"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
