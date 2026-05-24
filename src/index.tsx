import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import './index.scss';
import App from './app';
import { Provider } from './context';
import Login from './pages/Login';
import Register from './pages/Register';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Account from './pages/Account';
import ChangePassword from './pages/ChangePassword';
import BankDetails from './pages/BankDetails';
import Admin from './pages/Admin';
import BetHistory from './pages/BetHistory';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem("token");
	if (!token) return <Navigate to="/login" replace />;
	return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem("token");
	if (token) return <Navigate to="/" replace />;
	return <>{children}</>;
}

// Standalone pages don't have the game running underneath
const STANDALONE_PAGES = ['/admin'];
// Auth pages: also standalone but separate to avoid Unity loading on these public routes
const AUTH_PAGES = ['/login', '/register'];

function AppLayout() {
	const location = useLocation();
	const isStandalone = STANDALONE_PAGES.includes(location.pathname);
	const isAuthPage = AUTH_PAGES.includes(location.pathname);
	// Game stays mounted on home, deposit, withdraw, account, bet-history, etc.
	const showGame = !isStandalone && !isAuthPage;

	return (
		<>
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
					<Route path="/admin" element={<Admin />} />
				</Routes>
			)}

			<ToastContainer position="top-center" theme="dark" />
		</>
	);
}

createRoot(document.getElementById("root") as HTMLElement).render(
	<BrowserRouter>
		<AppLayout />
	</BrowserRouter>
);
