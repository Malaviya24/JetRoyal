import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

interface BetRecord {
  _id: number;
  name: string;
  betAmount: number;
  cashoutAt: number;
  cashouted: number;
  profit: number;
  date: string;
}

type Filter = "all" | "win" | "lose";

export default function BetHistory() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bets, setBets] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${config.api}/user/bet-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setBets(data.bets);
      } catch (e) {}
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = bets.filter((b) =>
    filter === "win" ? b.cashouted === 1 : filter === "lose" ? b.cashouted === 0 : true
  );

  const totalBet = bets.reduce((s, b) => s + Number(b.betAmount), 0);
  const totalProfit = bets.reduce((s, b) => s + Number(b.profit), 0);
  const wins = bets.filter((b) => b.cashouted === 1).length;
  const losses = bets.filter((b) => b.cashouted === 0).length;

  return (
    <PageShell
      title="Bet History"
      subtitle="Every round you've played, win or lose."
      icon={<Icons.History size={20} />}
      back="/account"
      wide
    >
      <div className="ps-stats">
        <div className="ps-stat">
          <span className="v">{bets.length}</span>
          <span className="l">Total Bets</span>
        </div>
        <div className="ps-stat green">
          <span className="v">{wins}</span>
          <span className="l">Wins</span>
        </div>
        <div className="ps-stat danger">
          <span className="v">{losses}</span>
          <span className="l">Losses</span>
        </div>
        <div className="ps-stat">
          <span className="v">₹{totalBet.toFixed(0)}</span>
          <span className="l">Wagered</span>
        </div>
        <div className={`ps-stat ${totalProfit >= 0 ? "green" : "danger"}`}>
          <span className="v">{totalProfit >= 0 ? "+" : ""}₹{totalProfit.toFixed(0)}</span>
          <span className="l">Net Profit</span>
        </div>
      </div>

      <div className="ps-tabs">
        {(["all", "win", "lose"] as const).map((f) => (
          <button
            key={f}
            className={`ps-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "win" ? "Wins" : "Losses"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ps-loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="ps-empty">No bets in this view.</div>
      ) : (
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Bet</th>
                <th>Cashout</th>
                <th style={{ textAlign: "center" }}>Result</th>
                <th style={{ textAlign: "right" }}>Profit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bet, i) => (
                <tr key={bet._id}>
                  <td className="ps-text-muted">{filtered.length - i}</td>
                  <td>{new Date(bet.date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td>₹{Number(bet.betAmount).toFixed(2)}</td>
                  <td>{bet.cashouted ? `${Number(bet.cashoutAt).toFixed(2)}x` : "—"}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`ps-pill ${bet.cashouted ? "approved" : "rejected"}`}>
                      {bet.cashouted ? "WIN" : "LOSE"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} className={Number(bet.profit) >= 0 ? "ps-pos" : "ps-neg"}>
                    {Number(bet.profit) >= 0 ? "+" : ""}₹{Number(bet.profit).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
