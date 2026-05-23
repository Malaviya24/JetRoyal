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
	if (token) return <Navigate to="/game" replace />;
	return <>{children}</>;
}

// The game stays mounted always (hidden when on other pages) to prevent Unity crash
function AppLayout() {
	const location = useLocation();
	const token = localStorage.getItem("token");
	const isGamePage = location.pathname === "/game";
	const showGame = token && isGamePage;

	return (
		<>
			{/* Game is always mounted when logged in, just hidden when not on /game */}
			{token && (
				<div style={{ display: isGamePage ? 'block' : 'none', height: '100%' }}>
					<Provider>
						<App />
					</Provider>
				</div>
			)}

			{/* Other pages render on top */}
			{!showGame && (
				<Routes>
					<Route path="/login" element={
						<AuthRedirect><Login /></AuthRedirect>
					} />
					<Route path="/register" element={
						<AuthRedirect><Register /></AuthRedirect>
					} />
					<Route path="/deposit" element={
						<ProtectedRoute><Deposit /></ProtectedRoute>
					} />
					<Route path="/withdraw" element={
						<ProtectedRoute><Withdraw /></ProtectedRoute>
					} />
					<Route path="/account" element={
						<ProtectedRoute><Account /></ProtectedRoute>
					} />
					<Route path="/account/password" element={
						<ProtectedRoute><ChangePassword /></ProtectedRoute>
					} />
					<Route path="/account/bank" element={
						<ProtectedRoute><BankDetails /></ProtectedRoute>
					} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="*" element={<Navigate to="/login" replace />} />
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
