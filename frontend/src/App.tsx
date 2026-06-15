import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/layout/Layout";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Landing from "./pages/Landing/Landing";
import Dashboard from "./pages/Dashboard/Dashboard";
import SendMoney from "./pages/Transfers/SendMoney";
import ReceiveMoney from "./pages/Transfers/ReceiveMoney";
import Withdraw from "./pages/Transfers/Withdraw";
import Deposit from "./pages/Transfers/Deposit";
import TransactionHistory from "./pages/History/TransactionHistory";
import Security from "./pages/Security/Security";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminTransactions from "./pages/Admin/AdminTransactions";
import AdminDeposits from "./pages/Admin/AdminDeposits";
import AdminWithdrawals from "./pages/Admin/AdminWithdrawals";
import AdminWallets from "./pages/Admin/AdminWallets";
import AdminAgents from "./pages/Admin/AdminAgents";
import AdminMerchants from "./pages/Admin/AdminMerchants";
import AdminReports from "./pages/Admin/AdminReports";
import AdminSecurity from "./pages/Admin/AdminSecurity";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminContent from "./pages/Admin/AdminContent";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import { AdminLayout } from "./components/layout/AdminLayout";
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

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, user } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!authenticated) return <Navigate to="/secure-admin-portal" replace />;
  if (user?.role !== "admin" && user?.role !== "support") return <Navigate to="/dashboard" replace />;
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
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/secure-admin-portal" element={<GuestGuard><AdminLogin /></GuestGuard>} />
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<SendMoney />} />
              <Route path="/receive" element={<ReceiveMoney />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/security" element={<Security />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/airtime" element={<Airtime />} />
              <Route path="/bills" element={<BillPayments />} />
              <Route path="/merchant" element={<MerchantPayments />} />
            </Route>
            <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route path="/secure-admin/dashboard" element={<AdminDashboard />} />
              <Route path="/secure-admin/users" element={<AdminUsers />} />
              <Route path="/secure-admin/transactions" element={<AdminTransactions />} />
              <Route path="/secure-admin/deposits" element={<AdminDeposits />} />
              <Route path="/secure-admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/secure-admin/wallets" element={<AdminWallets />} />
              <Route path="/secure-admin/agents" element={<AdminAgents />} />
              <Route path="/secure-admin/merchants" element={<AdminMerchants />} />
              <Route path="/secure-admin/reports" element={<AdminReports />} />
              <Route path="/secure-admin/security" element={<AdminSecurity />} />
              <Route path="/secure-admin/settings" element={<AdminSettings />} />
              <Route path="/secure-admin/notifications" element={<AdminNotifications />} />
              <Route path="/secure-admin/content" element={<AdminContent />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
