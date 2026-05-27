import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { Icons } from "../components/Icons";
import "../components/page-shell.scss";

export default function Account() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const items: Array<{
    title: string;
    sub: string;
    icon: React.ReactNode;
    to?: string;
    danger?: boolean;
    onClick?: () => void;
  }> = [
    { title: "Deposit",          sub: "Add funds via UPI",                icon: <Icons.ArrowDownToLine size={18} />, to: "/deposit" },
    { title: "Withdraw",         sub: "Transfer to your bank",            icon: <Icons.ArrowUpFromLine size={18} />, to: "/withdraw" },
    { title: "Bet History",      sub: "Review past rounds",               icon: <Icons.History size={18} />,         to: "/bet-history" },
    { title: "Transactions",     sub: "Deposits, withdrawals, credits",   icon: <Icons.Receipt size={18} />,         to: "/transactions" },
    { title: "Refer & Earn",     sub: "Invite friends, both get bonus",   icon: <Icons.Gift size={18} />,            to: "/referrals" },
    { title: "Bank Details",     sub: "For withdrawals",                  icon: <Icons.Bank size={18} />,            to: "/account/bank" },
    { title: "Change Password",  sub: "Update your credentials",          icon: <Icons.Lock size={18} />,            to: "/account/password" },
    { title: "Logout",           sub: "Sign out of this device",          icon: <Icons.LogOut size={18} />,          onClick: handleLogout, danger: true },
  ];

  return (
    <PageShell
      title="My Account"
      subtitle={user.name || user.username ? `Signed in as ${user.name || user.username}` : "Manage your profile"}
      icon={<Icons.User size={20} />}
      back="/"
    >
      <div className="ps-stats">
        <div className="ps-stat">
          <span className="l">Username</span>
          <span className="v" style={{ fontSize: 16 }}>{user.username || "—"}</span>
        </div>
        <div className="ps-stat">
          <span className="l">Phone</span>
          <span className="v" style={{ fontSize: 16 }}>{user.phone || "—"}</span>
        </div>
      </div>

      <div className="ps-menu">
        {items.map((item) => (
          <button
            key={item.title}
            className={`ps-menu-item ${item.danger ? "danger" : ""}`}
            onClick={() => item.to ? navigate(item.to) : item.onClick?.()}
          >
            <span className="mi-icon">{item.icon}</span>
            <span className="mi-body">
              <span className="mi-title">{item.title}</span>
              <span className="mi-sub">{item.sub}</span>
            </span>
            <span className="mi-arrow"><Icons.ChevronRight size={16} /></span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
