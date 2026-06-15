import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, Send, Download, ArrowUpFromLine, ArrowDownToLine,
  Smartphone, FileText, Store, Clock, Shield, ShieldCheck, Settings, Bell, X
} from "lucide-react";

const links = [
  { to: "/dashboard", labelKey: "Dashboard", icon: LayoutDashboard },
  { to: "/send", labelKey: "Send Money", icon: Send },
  { to: "/receive", labelKey: "Receive Money", icon: Download },
  { to: "/withdraw", labelKey: "Withdraw", icon: ArrowUpFromLine },
  { to: "/deposit", labelKey: "Deposit", icon: ArrowDownToLine },
  { to: "/airtime", labelKey: "Airtime", icon: Smartphone },
  { to: "/bills", labelKey: "Bill Payments", icon: FileText },
  { to: "/merchant", labelKey: "Merchant Payments", icon: Store },
  { to: "/history", labelKey: "History", icon: Clock },
  { to: "/security", labelKey: "Security", icon: Shield },
  { to: "/notifications", labelKey: "Notifications", icon: Bell },
  { to: "/secure-admin/dashboard", labelKey: "Admin", icon: ShieldCheck, adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();

  const linkList = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {links.map((link) => {
        if (link.adminOnly && user?.role !== "admin" && user?.role !== "support") return null;
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{link.labelKey}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        <div className={`flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-800 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && <span className="font-bold text-lg text-slate-900 dark:text-slate-100">SecureMoney</span>}
        </div>
        {linkList}
        {!collapsed && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.email || "User"}</p>
                <p className="text-xs text-slate-400">{user?.role || "user"}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-72 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">SecureMoney</span>
              </div>
              <button onClick={onMobileClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {linkList}
          </aside>
        </div>
      )}
    </>
  );
}
