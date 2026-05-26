import React, { useEffect, useState, useCallback } from "react";
import "./install-prompt.scss";

// PWA-related types not in lib.dom.d.ts yet
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = "jr_install_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari adds this when launched from home screen
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

// Singleton store so the hamburger button and the popup share state.
let cachedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const subscribers = new Set<() => void>();

function setDeferredPrompt(p: BeforeInstallPromptEvent | null) {
  cachedDeferredPrompt = p;
  subscribers.forEach((fn) => fn());
}

function useDeferredPrompt(): BeforeInstallPromptEvent | null {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subscribers.add(fn);
    return () => { subscribers.delete(fn); };
  }, []);
  return cachedDeferredPrompt;
}

// Listener registered once at module load
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setDeferredPrompt(e as BeforeInstallPromptEvent);
  });
  window.addEventListener("appinstalled", () => {
    setDeferredPrompt(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  });
}

/**
 * Auto-show install popup on first visit (or after cooldown). Hides when
 * already installed. Falls back to iOS instructions on iPhone/iPad.
 */
export function InstallAppPopup() {
  const deferredPrompt = useDeferredPrompt();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed
    let cooldownPassed = true;
    try {
      const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || "0");
      cooldownPassed = !dismissedAt || Date.now() - dismissedAt > DISMISS_COOLDOWN_MS;
    } catch (e) {}
    if (!cooldownPassed) return;

    // Show after a short delay so the page renders first
    const t = window.setTimeout(() => {
      // On non-iOS we wait until the browser fired beforeinstallprompt.
      // On iOS we still show the manual instructions.
      if (deferredPrompt || isIos()) setOpen(true);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [deferredPrompt]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
    setOpen(false);
  };

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (e) {
      // ignore
    }
    dismiss();
  }, [deferredPrompt]);

  if (!open) return null;

  const ios = isIos() && !deferredPrompt;

  return (
    <div className="install-overlay" onClick={dismiss}>
      <div className="install-card" onClick={(e) => e.stopPropagation()}>
        <button className="install-close" onClick={dismiss} aria-label="Close">×</button>

        <div className="install-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#e69308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        <h2 className="install-title">Install JetRoyal Aviator</h2>
        <p className="install-text">
          Add the app to your home screen for a faster, full-screen experience.
        </p>

        {ios ? (
          <div className="install-ios-steps">
            <div className="ios-step">
              <span className="ios-step-num">1</span>
              <span>Tap the <strong>Share</strong> button below</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
            <div className="ios-step">
              <span className="ios-step-num">2</span>
              <span>Choose <strong>Add to Home Screen</strong></span>
            </div>
          </div>
        ) : (
          <button className="install-btn" onClick={install}>
            Install App
          </button>
        )}

        <button className="install-later" onClick={dismiss}>Maybe later</button>
      </div>
    </div>
  );
}

/**
 * Small "Install App" button suitable for the hamburger menu. Renders nothing
 * if the app is already installed or no install path is available.
 */
export function InstallAppMenuButton({ onClick }: { onClick?: () => void }) {
  const deferredPrompt = useDeferredPrompt();
  const [, rerender] = useState(0);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Re-render once after mount so isStandalone() runs in browser
    rerender((n) => n + 1);
  }, []);

  if (isStandalone()) return null;

  const handleClick = async () => {
    onClick?.();
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") setDeferredPrompt(null);
      } catch (e) {}
      return;
    }
    if (isIos()) {
      setShowIosHint(true);
    }
  };

  // Hide button if neither install prompt nor iOS — desktop browsers without
  // beforeinstallprompt support.
  if (!deferredPrompt && !isIos()) return null;

  return (
    <>
      <button onClick={handleClick}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e69308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Install App</span>
      </button>
      {showIosHint && (
        <div className="install-overlay" onClick={() => setShowIosHint(false)}>
          <div className="install-card" onClick={(e) => e.stopPropagation()}>
            <button className="install-close" onClick={() => setShowIosHint(false)}>×</button>
            <h2 className="install-title">Add to Home Screen</h2>
            <div className="install-ios-steps">
              <div className="ios-step">
                <span className="ios-step-num">1</span>
                <span>Tap the <strong>Share</strong> button in Safari</span>
              </div>
              <div className="ios-step">
                <span className="ios-step-num">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
              </div>
              <div className="ios-step">
                <span className="ios-step-num">3</span>
                <span>Tap <strong>Add</strong> to confirm</span>
              </div>
            </div>
            <button className="install-later" onClick={() => setShowIosHint(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
