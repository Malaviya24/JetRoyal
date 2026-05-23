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

function AppLayout() {
	const location = useLocation();
	const isHomePage = location.pathname === "/" || location.pathname === "/game";
	const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
	const isAdminPage = location.pathname === "/admin";

	return (
		<>
			{/* Game is always visible on home page - for everyone */}
			{isHomePage && (
				<div style={{ height: '100%' }}>
					<Provider>
						<App />
					</Provider>
				</div>
			)}

			{/* Auth and other pages */}
			{!isHomePage && (
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
