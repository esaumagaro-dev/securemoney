import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Toaster } from "react-hot-toast";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { borderRadius: "12px", padding: "12px 16px", fontSize: "14px" },
        success: { iconTheme: { primary: "#10B981", secondary: "#FFFFFF" } },
        error: { iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" } },
      }} />
    </div>
  );
}
