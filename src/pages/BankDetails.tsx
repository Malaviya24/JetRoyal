import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../config";
import { authFetch } from "../utils/authFetch";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

export default function BankDetails() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchBankDetails = useCallback(async () => {
    try {
      const res = await authFetch(`${config.api}/user/bank-details`, {
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
  }, [token]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBankDetails();
  }, [token, navigate, fetchBankDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "ifscCode" ? value.toUpperCase() : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    try {
      const res = await authFetch(`${config.api}/user/bank-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) toast.success(data.message);
      else toast.error(data.error || "Failed to save bank details");
    } catch (err) {
      toast.error("Server error");
    }
    setLoading(false);
  };

  return (
    <PageShell
      title="Bank Details"
      subtitle="Used for processing withdrawals to your account."
      icon={<Icons.Bank size={20} />}
      back="/account"
    >
      <form className="ps-form" onSubmit={handleSubmit}>
        <div className="ps-field">
          <label>Account Holder Name</label>
          <input
            type="text"
            name="accountHolder"
            placeholder="Full name as on bank account"
            value={form.accountHolder}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ps-field">
          <label>Account Number</label>
          <input
            type="text"
            name="accountNumber"
            placeholder="Enter account number"
            value={form.accountNumber}
            onChange={handleChange}
            required
            inputMode="numeric"
          />
        </div>

        <div className="ps-field">
          <label>IFSC Code</label>
          <input
            type="text"
            name="ifscCode"
            placeholder="e.g. HDFC0001234"
            value={form.ifscCode}
            onChange={handleChange}
            required
            maxLength={11}
          />
        </div>

        <div className="ps-field">
          <label>Bank Name</label>
          <input
            type="text"
            name="bankName"
            placeholder="e.g. HDFC Bank"
            value={form.bankName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ps-field">
          <label>UPI ID <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
          <input
            type="text"
            name="upiId"
            placeholder="name@upi"
            value={form.upiId}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="ps-btn ps-block" disabled={loading}>
          {loading ? "Saving..." : "Save Bank Details"}
        </button>
      </form>
    </PageShell>
  );
}
