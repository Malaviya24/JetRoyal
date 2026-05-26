import React, { useEffect, useState, useCallback } from "react";
import "./install-prompt.scss";

// PWA-related types not in lib.dom.d.ts yet
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = "jr_install_seen";

type Browser =
  | "chrome"
  | "edge"
  | "brave"
  | "firefox"
  | "safari"
  | "samsung"
  | "opera"
  | "other";

function detectBrowser(): Browser {
  const ua = navigator.userAgent.toLowerCase();
  // Check Brave first (Brave UA matches Chrome too)
  if ((navigator as unknown as { brave?: { isBrave: () => Promise<boolean> } }).brave) return "brave";
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "opera";
  if (ua.includes("samsungbrowser")) return "samsung";
  if (ua.includes("firefox") || ua.includes("fxios")) return "firefox";
  if (ua.includes("crios") || ua.includes("chrome")) return "chrome";
  if (ua.includes("safari")) return "safari";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isMobile(): boolean {
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
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
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
  });
}

// ============================================================
// Browser-specific install instructions
// ============================================================
interface Step {
  num: number;
  text: React.ReactNode;
}

function getInstructions(browser: Browser): { title: string; steps: Step[] } {
  if (isIos()) {
    return {
      title: "Add to Home Screen (iOS)",
      steps: [
        { num: 1, text: <>Tap the <strong>Share</strong> button at the bottom of Safari</> },
        { num: 2, text: <>Scroll down and tap <strong>Add to Home Screen</strong></> },
        { num: 3, text: <>Tap <strong>Add</strong> in the top right corner</> },
      ],
    };
  }
  switch (browser) {
    case "chrome":
      return {
        title: "Install in Chrome",
        steps: [
          { num: 1, text: <>Tap the <strong>⋮ menu</strong> in the top right of Chrome</> },
          { num: 2, text: <>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong></> },
          { num: 3, text: <>Tap <strong>Install</strong> to confirm</> },
        ],
      };
    case "edge":
      return {
        title: "Install in Edge",
        steps: [
          { num: 1, text: <>Click the <strong>⋯ menu</strong> in the top right</> },
          { num: 2, text: <>Choose <strong>Apps → Install this site as an app</strong></> },
          { num: 3, text: <>Click <strong>Install</strong></> },
        ],
      };
    case "brave":
      return {
        title: "Install in Brave",
        steps: [
          { num: 1, text: <>Click the <strong>≡ menu</strong> in the top right of Brave</> },
          { num: 2, text: <>Choose <strong>Install JetRoyal Aviator…</strong></> },
          { num: 3, text: <>If you don't see it, open <code>brave://flags</code> and enable <strong>"Desktop PWAs"</strong></> },
        ],
      };
    case "samsung":
      return {
        title: "Install on Samsung Internet",
        steps: [
          { num: 1, text: <>Tap the <strong>≡ menu</strong> at the bottom right</> },
          { num: 2, text: <>Choose <strong>Add page to → Home screen</strong></> },
        ],
      };
    case "opera":
      return {
        title: "Install in Opera",
        steps: [
          { num: 1, text: <>Tap the <strong>O menu</strong></> },
          { num: 2, text: <>Choose <strong>Add to → Home screen</strong></> },
        ],
      };
    case "firefox":
      return {
        title: isMobile() ? "Add to Home (Firefox)" : "Install in Firefox",
        steps: isMobile()
          ? [
              { num: 1, text: <>Tap the <strong>⋮ menu</strong> in the address bar</> },
              { num: 2, text: <>Choose <strong>Install</strong> or <strong>Add to Home Screen</strong></> },
            ]
          : [
              { num: 1, text: <>Firefox desktop does not yet support PWA install.</> },
              { num: 2, text: <>Open this site in <strong>Chrome</strong> or <strong>Edge</strong> to install it.</> },
            ],
      };
    case "safari":
      return {
        title: "Install in Safari",
        steps: [
          { num: 1, text: <>Click <strong>File → Add to Dock</strong> in the menu bar</> },
          { num: 2, text: <>Confirm by clicking <strong>Add</strong></> },
        ],
      };
    default:
      return {
        title: "Add to Home Screen",
        steps: [
          { num: 1, text: <>Open your browser's main menu (often <strong>⋮</strong> or <strong>⋯</strong>)</> },
          { num: 2, text: <>Look for <strong>Install</strong> or <strong>Add to Home screen</strong></> },
        ],
      };
  }
}

// ============================================================
// Reusable install card
// ============================================================
interface CardProps {
  onClose: () => void;
  showLater?: boolean;
}

function InstallCard({ onClose, showLater = true }: CardProps) {
  const deferredPrompt = useDeferredPrompt();
  const browser = detectBrowser();
  const instructions = getInstructions(browser);
  const canDirectInstall = !!deferredPrompt;

  const tryDirect = useCallback(async () => {
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
    onClose();
  }, [deferredPrompt, onClose]);

  return (
    <div className="install-overlay" onClick={onClose}>
      <div className="install-card" onClick={(e) => e.stopPropagation()}>
        <button className="install-close" onClick={onClose} aria-label="Close">×</button>

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

        {canDirectInstall && (
          <button className="install-btn" onClick={tryDirect}>
            Install App
          </button>
        )}

        <div className="install-guide">
          <div className="install-guide-title">{instructions.title}</div>
          <div className="install-ios-steps">
            {instructions.steps.map((s) => (
              <div key={s.num} className="ios-step">
                <span className="ios-step-num">{s.num}</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {showLater && (
          <button className="install-later" onClick={onClose}>Maybe later</button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Auto popup on first visit
// ============================================================
export function InstallAppPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed
    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {}
    if (alreadySeen) return;

    // Show after a short delay so the page renders first.
    const t = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    setOpen(false);
  };

  if (!open) return null;
  return <InstallCard onClose={dismiss} />;
}

// ============================================================
// Hamburger menu button — always visible (unless installed)
// ============================================================
export function InstallAppMenuButton({ onClick }: { onClick?: () => void }) {
  const [showCard, setShowCard] = useState(false);
  const [, rerender] = useState(0);

  useEffect(() => {
    // Re-render once after mount so isStandalone() runs in browser
    rerender((n) => n + 1);
  }, []);

  if (isStandalone()) return null;

  const handleClick = () => {
    onClick?.();
    setShowCard(true);
  };

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
      {showCard && <InstallCard onClose={() => setShowCard(false)} showLater={false} />}
    </>
  );
}
