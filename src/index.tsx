import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import './index.scss';
import App from './app';
import { Provider } from './context';
import { config } from './config';
import Login from './pages/Login';
import Register from './pages/Register';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Account from './pages/Account';
import ChangePassword from './pages/ChangePassword';
import BankDetails from './pages/BankDetails';
import Admin from './pages/Admin';
import BetHistory from './pages/BetHistory';
import Transactions from './pages/Transactions';
import Referrals from './pages/Referrals';
import NotFound from './pages/NotFound';
import { InstallAppPopup } from './components/InstallPrompt';

// Validate the stored token once on app load. If the server's JWT_SECRET
// changed (production deploy with new secret) old tokens are invalid;
// drop them silently so the user just gets sent to /login on next protected
// action instead of seeing 401 errors everywhere.
(function validateTokenOnce() {
	const token = localStorage.getItem("token");
	if (!token) return;
	fetch(`${config.api}/user/profile`, {
		headers: { Authorization: `Bearer ${token}` },
	})
		.then((res) => {
			if (res.status === 401) {
				localStorage.removeItem("token");
			}
		})
		.catch(() => { /* offline / network — leave token alone */ });
})();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem("token");
	if (!token) return <Navigate to="/login" replace />;
	return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem("token");
	if (token) {
		window.location.href = "/";
		return null;
	}
	return <>{children}</>;
}

// Standalone pages don't have the game running underneath
// NOTE: admin panel lives at an obscure path so it can't be guessed by users.
const ADMIN_PATH = '/jr-control-panel-7k9x2';
const STANDALONE_PAGES = [ADMIN_PATH];
// Auth pages: also standalone but separate to avoid Unity loading on these public routes
const AUTH_PAGES = ['/login', '/register'];
// All known game/overlay routes. Anything else is a 404.
const KNOWN_ROUTES = [
	'/', '/game',
	'/deposit', '/withdraw',
	'/account', '/account/password', '/account/bank',
	'/bet-history', '/transactions', '/referrals',
];

function AppLayout() {
	const location = useLocation();
	const isStandalone = STANDALONE_PAGES.includes(location.pathname);
	const isAuthPage = AUTH_PAGES.includes(location.pathname);
	const isKnownRoute =
		KNOWN_ROUTES.includes(location.pathname) ||
		isStandalone ||
		isAuthPage;
	// Show the themed 404 for anything we don't recognize
	const isNotFound = !isKnownRoute;
	// Game stays mounted on home, deposit, withdraw, account, bet-history, etc.
	const showGame = !isStandalone && !isAuthPage && !isNotFound;

	return (
		<>
			{/* 404 — themed page with redirect button */}
			{isNotFound && (
				<Routes>
					<Route path="*" element={<NotFound />} />
				</Routes>
			)}

			{/* Game is mounted ONCE for the lifetime of the session */}
			{showGame && (
				<div style={{ height: '100%', position: 'relative' }}>
					<Provider>
						<App />
					</Provider>
					{/* Overlay pages render on top of the game */}
					<div style={{
						position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
						zIndex: 1000,
						background: '#0e0e0e',
						overflowY: 'auto',
						display: location.pathname === '/' || location.pathname === '/game' ? 'none' : 'block'
					}}>
						<Routes>
							<Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
							<Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
							<Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
							<Route path="/account/password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
							<Route path="/account/bank" element={<ProtectedRoute><BankDetails /></ProtectedRoute>} />
							<Route path="/bet-history" element={<ProtectedRoute><BetHistory /></ProtectedRoute>} />
							<Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
							<Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
							<Route path="*" element={<></>} />
						</Routes>
					</div>
				</div>
			)}

			{/* Auth pages — completely separate, no Unity */}
			{isAuthPage && (
				<Routes>
					<Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
					<Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
				</Routes>
			)}

			{/* Admin page — completely separate */}
			{isStandalone && (
				<Routes>
					<Route path={ADMIN_PATH} element={<Admin />} />
				</Routes>
			)}

			<ToastContainer position="top-center" theme="dark" />
			{/* PWA install popup — shows once per cooldown when the app isn't installed */}
			<InstallAppPopup />
		</>
	);
}

createRoot(document.getElementById("root") as HTMLElement).render(
	<BrowserRouter>
		<AppLayout />
	</BrowserRouter>
);
