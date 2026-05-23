import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import "./auth.scss";

export default function BankDetails() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const res = await fetch(`${config.api}/user/bank-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.bank) {
        setForm({
          accountHolder: data.bank.account_holder || "",
          accountNumber: data.bank.account_number || "",
          ifscCode: data.bank.ifsc_code || "",
          bankName: data.bank.bank_name || "",
          upiId: data.bank.upi_id || "",
        });
      }
    } catch (e) {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${config.api}/user/bank-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed to save bank details");
      }
    } catch (err) {
      toast.error("Server error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <button className="page-back-btn" onClick={() => navigate("/game")}>← Back to Game</button>
      <div className="auth-container dashboard-container">
        <div className="auth-header">
          <h1>🏦 Bank Details</h1>
          <p>Add your withdrawal bank details</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              name="accountHolder"
              placeholder="Enter account holder name"
              value={form.accountHolder}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              placeholder="Enter account number"
              value={form.accountNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              placeholder="Enter IFSC code"
              value={form.ifscCode}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              placeholder="Enter bank name"
              value={form.bankName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>UPI ID (Optional)</label>
            <input
              type="text"
              name="upiId"
              placeholder="Enter UPI ID (e.g. name@upi)"
              value={form.upiId}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Saving..." : "SAVE BANK DETAILS"}
          </button>
        </form>

        <div className="auth-footer">
          <button className="back-btn" onClick={() => navigate("/account")}>← Back to Account</button>
        </div>
      </div>
    </div>
  );
}
