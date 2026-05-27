// Shared page wrapper for all user-facing pages outside the game.
// Gives every screen the same header (back button + icon + title + subtitle),
// the same dark gradient background, and the same content card frame.

import React from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "./Icons";
import "./page-shell.scss";

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  back?: string | (() => void);
  rightSlot?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  icon,
  back,
  rightSlot,
  wide = false,
  children,
}: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === "function") {
      back();
    } else if (typeof back === "string") {
      navigate(back);
    } else {
      // Default: back to game home, full reload to be safe with Unity
      window.location.href = "/";
    }
  };

  return (
    <div className="ps-page">
      <div className={`ps-shell ${wide ? "ps-wide" : ""}`}>
        <div className="ps-topbar">
          <button className="ps-back" onClick={handleBack} aria-label="Back">
            <Icons.ArrowLeft size={16} />
            <span>Back</span>
          </button>
          {rightSlot && <div className="ps-right">{rightSlot}</div>}
        </div>

        <div className="ps-card">
          <div className="ps-header">
            {icon && <div className="ps-icon">{icon}</div>}
            <div className="ps-titles">
              <h1 className="ps-title">{title}</h1>
              {subtitle && <p className="ps-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="ps-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
