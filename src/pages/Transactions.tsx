import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  utrNumber: string;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  deposit:        "Deposit",
  withdrawal:     "Withdrawal",
  admin_credit:   "Admin Credit",
  admin_debit:    "Admin Debit",
  referral_bonus: "Referral Bonus",
};

const isDebit = (type: string) =>
  type === "withdrawal" || type === "admin_debit";

export default function Transactions() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        const res = await authFetch(`${config.api}/user/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setTransactions(data.transactions);
      } catch (e) {}
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      title="Transaction History"
      subtitle="Deposits, withdrawals, bonuses and admin adjustments."
      icon={<Icons.Receipt size={20} />}
      back="/account"
      wide
    >
      {loading ? (
        <div className="ps-loading">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="ps-empty">No transactions yet.</div>
      ) : (
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                  <td>{TYPE_LABEL[txn.type] || txn.type}</td>
                  <td style={{ textAlign: "right" }} className={isDebit(txn.type) ? "ps-neg" : "ps-pos"}>
                    {isDebit(txn.type) ? "-" : "+"}₹{Number(txn.amount).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`ps-pill ${txn.status}`}>{txn.status}</span>
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
