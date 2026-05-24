import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import "./auth.scss";
import "./bethistory.scss";

interface BetRecord {
  _id: number;
  name: string;
  betAmount: number;
  cashoutAt: number;
  cashouted: number;
  profit: number;
  date: string;
}

export default function BetHistory() {
  const navigate = useNavigate();
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "win" | "lose">("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBetHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBetHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.api}/user/bet-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBets(data.bets);
    } catch (e) {}
    setLoading(false);
  };

  const filtered = bets.filter(b => {
    if (filter === "win") return b.cashouted === 1;
    if (filter === "lose") return b.cashouted === 0;
    return true;
  });

  const totalBet = bets.reduce((s, b) => s + b.betAmount, 0);
  const totalProfit = bets.reduce((s, b) => s + b.profit, 0);
  const wins = bets.filter(b => b.cashouted === 1).length;
  const losses = bets.filter(b => b.cashouted === 0).length;

  return (
    <div className="auth-page bet-history-page">
      <button className="page-back-btn" onClick={() => navigate("/")}>← Back to Game</button>
      <div className="bet-history-container">
        <div className="bh-header">
          <h1>📋 My Bet History</h1>
          <p>All your bets from start to end</p>
        </div>

        {/* Stats cards */}
        <div className="bh-stats">
          <div className="bh-stat">
            <span className="bh-stat-val">{bets.length}</span>
            <span className="bh-stat-label">Total Bets</span>
          </div>
          <div className="bh-stat green">
            <span className="bh-stat-val">{wins}</span>
            <span className="bh-stat-label">Wins</span>
          </div>
          <div className="bh-stat red">
            <span className="bh-stat-val">{losses}</span>
            <span className="bh-stat-label">Losses</span>
          </div>
          <div className="bh-stat">
            <span className="bh-stat-val">₹{totalBet.toFixed(0)}</span>
            <span className="bh-stat-label">Total Wagered</span>
          </div>
          <div className={`bh-stat ${totalProfit >= 0 ? "green" : "red"}`}>
            <span className="bh-stat-val">₹{totalProfit.toFixed(0)}</span>
            <span className="bh-stat-label">Net Profit</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bh-filters">
          {(["all", "win", "lose"] as const).map(f => (
            <button
              key={f}
              className={`bh-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "win" ? "Wins ✓" : "Losses ✗"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bh-table-wrap">
          {loading ? (
            <div className="bh-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="bh-empty">No bets found</div>
          ) : (
            <table className="bh-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Bet (₹)</th>
                  <th>Cashout</th>
                  <th>Result</th>
                  <th>Profit (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bet, i) => (
                  <tr key={bet._id} className={bet.cashouted ? "win-row" : "lose-row"}>
                    <td>{filtered.length - i}</td>
                    <td>{new Date(bet.date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td>₹{Number(bet.betAmount).toFixed(2)}</td>
                    <td>{bet.cashouted ? `${Number(bet.cashoutAt).toFixed(2)}x` : "—"}</td>
                    <td>
                      {bet.cashouted
                        ? <span className="result-badge win">WIN</span>
                        : <span className="result-badge lose">LOSE</span>}
                    </td>
                    <td className={Number(bet.profit) >= 0 ? "profit-pos" : "profit-neg"}>
                      {Number(bet.profit) >= 0 ? "+" : ""}₹{Number(bet.profit).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
