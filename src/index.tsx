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

// Pages that overlay the game
const OVERLAY_PAGES = ['/deposit', '/withdraw', '/account', '/account/password', '/account/bank'];

function AppLayout() {
	const location = useLocation();
	const isStandalonePage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin';
	const isOverlayPage = OVERLAY_PAGES.some(p => location.pathname.startsWith(p));
	const isGamePage = !isStandalonePage;

	return (
		<>
			{/* Game is always mounted on non-standalone pages to keep Unity alive */}
			{isGamePage && (
				<div style={{ height: '100%', position: 'relative' }}>
					<Provider>
						<App />
					</Provider>
					{/* Overlay pages render on top of the game */}
					{isOverlayPage && (
						<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: '#0e0e0e', overflowY: 'auto' }}>
							<Routes>
								<Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
								<Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
								<Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
								<Route path="/account/password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
								<Route path="/account/bank" element={<ProtectedRoute><BankDetails /></ProtectedRoute>} />
							</Routes>
						</div>
					)}
				</div>
			)}

			{/* Standalone pages */}
			{isStandalonePage && (
				<Routes>
					<Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
					<Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
					<Route path="/admin" element={<Admin />} />
				</Routes>
			)}

			{/* Default redirect for unknown paths */}
			{!isGamePage && !isStandalonePage && (
				<Routes>
					<Route path="*" element={<Navigate to="/" replace />} />
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
