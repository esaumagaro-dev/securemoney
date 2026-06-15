import React, { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Shield, Users, Repeat, Wallet, ArrowUpFromLine, ArrowDownToLine, FileText, Store, BarChart3, Settings, Bell, Flag, LogOut, Menu, X, LayoutDashboard, UserPlus, Activity } from "lucide-react";
import { Toaster } from "react-hot-toast";

const adminLinks = [
  { to: "/secure-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/secure-admin/users", icon: Users, label: "Users" },
  { to: "/secure-admin/transactions", icon: Repeat, label: "Transactions" },
  { to: "/secure-admin/deposits", icon: ArrowDownToLine, label: "Deposits" },
  { to: "/secure-admin/withdrawals", icon: ArrowUpFromLine, label: "Withdrawals" },
  { to: "/secure-admin/wallets", icon: Wallet, label: "Wallets" },
  { to: "/secure-admin/agents", icon: UserPlus, label: "Agents" },
  { to: "/secure-admin/merchants", icon: Store, label: "Merchants" },
  { to: "/secure-admin/reports", icon: BarChart3, label: "Reports" },
  { to: "/secure-admin/security", icon: Activity, label: "Security" },
  { to: "/secure-admin/settings", icon: Settings, label: "Settings" },
  { to: "/secure-admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/secure-admin/content", icon: Flag, label: "Content" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/secure-admin-portal");
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-800">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {adminLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{user?.email?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-slate-900">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
              <span className="font-bold text-white">Admin Panel</span>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {adminLinks.map(link => (
                <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                  <link.icon className="w-5 h-5" /><span>{link.label}</span>
                </NavLink>
              ))}
              <hr className="my-3 border-slate-800" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 w-full"><LogOut className="w-5 h-5" /> Sign Out</button>
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"><Menu className="w-5 h-5" /></button>
            <h1 className="text-lg font-semibold text-white">SecureMoney Admin</h1>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-primary hover:underline">Back to App</button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", padding: "12px 16px", fontSize: "14px", background: "#1e293b", color: "#f1f5f9" } }} />
    </div>
  );
}
