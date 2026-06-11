import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/layout/Layout";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import SendMoney from "./pages/Transfers/SendMoney";
import ReceiveMoney from "./pages/Transfers/ReceiveMoney";
import Withdraw from "./pages/Transfers/Withdraw";
import Deposit from "./pages/Transfers/Deposit";
import TransactionHistory from "./pages/History/TransactionHistory";
import Security from "./pages/Security/Security";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import Notifications from "./pages/Notifications/Notifications";
import Airtime from "./pages/Airtime/Airtime";
import BillPayments from "./pages/Bills/BillPayments";
import MerchantPayments from "./pages/Merchant/MerchantPayments";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (authenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
            <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<SendMoney />} />
              <Route path="/receive" element={<ReceiveMoney />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/security" element={<Security />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/airtime" element={<Airtime />} />
              <Route path="/bills" element={<BillPayments />} />
              <Route path="/merchant" element={<MerchantPayments />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
