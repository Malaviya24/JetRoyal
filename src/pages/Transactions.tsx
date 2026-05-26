import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import "./auth.scss";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  utrNumber: string;
  created_at: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await authFetch(`${config.api}/user/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTransactions(data.transactions);
    } catch (e) {}
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "#28a909";
    if (status === "rejected") return "#e63946";
    return "#e69308";
  };

  const getTypeLabel = (type: string) => {
    if (type === "deposit") return "Deposit";
    if (type === "withdrawal") return "Withdrawal";
    if (type === "admin_credit") return "Admin Credit";
    if (type === "admin_debit") return "Admin Debit";
    return type;
  };

  return (
    <div className="auth-page" style={{ alignItems: "flex-start", paddingTop: "50px" }}>
      <button className="page-back-btn" onClick={() => navigate("/")}>← Back to Game</button>
      <div className="auth-container" style={{ maxWidth: "600px" }}>
        <div className="auth-header">
          <h1>Transaction History</h1>
          <p>All your deposits, withdrawals and credits</p>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#9ea0a3" }}>Loading...</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ea0a3" }}>No transactions yet</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2c2d31" }}>
                  <th style={{ padding: "10px 8px", textAlign: "left", color: "#9ea0a3", fontSize: "11px", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "10px 8px", textAlign: "left", color: "#9ea0a3", fontSize: "11px", textTransform: "uppercase" }}>Type</th>
                  <th style={{ padding: "10px 8px", textAlign: "right", color: "#9ea0a3", fontSize: "11px", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ padding: "10px 8px", textAlign: "center", color: "#9ea0a3", fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "10px 8px", color: "#ddd" }}>
                      {new Date(txn.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td style={{ padding: "10px 8px", color: "#ddd" }}>{getTypeLabel(txn.type)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", color: txn.type.includes("debit") || txn.type === "withdrawal" ? "#e63946" : "#28a909", fontWeight: 700 }}>
                      {txn.type.includes("debit") || txn.type === "withdrawal" ? "-" : "+"}₹{Number(txn.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: getStatusColor(txn.status),
                        background: `${getStatusColor(txn.status)}20`,
                        border: `1px solid ${getStatusColor(txn.status)}50`,
                      }}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
