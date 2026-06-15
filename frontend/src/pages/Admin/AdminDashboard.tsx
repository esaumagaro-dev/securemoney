import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Repeat, Wallet, Shield, UserPlus, ArrowDownToLine, ArrowUpFromLine, BarChart3, Activity, Settings, Bell, Flag, Store } from "lucide-react";
import api from "../../services/api";

interface AnalyticsData {
  total_users: number;
  total_transactions: number;
  total_wallets: number;
  recent_users: { id: string; email: string; created_at: string }[];
}

const quickActions = [
  { to: "/secure-admin/users", icon: Users, label: "Users", color: "bg-blue-500/10 text-blue-400" },
  { to: "/secure-admin/transactions", icon: Repeat, label: "Transactions", color: "bg-emerald-500/10 text-emerald-400" },
  { to: "/secure-admin/deposits", icon: ArrowDownToLine, label: "Deposits", color: "bg-cyan-500/10 text-cyan-400" },
  { to: "/secure-admin/withdrawals", icon: ArrowUpFromLine, label: "Withdrawals", color: "bg-amber-500/10 text-amber-400" },
  { to: "/secure-admin/wallets", icon: Wallet, label: "Wallets", color: "bg-purple-500/10 text-purple-400" },
  { to: "/secure-admin/reports", icon: BarChart3, label: "Reports", color: "bg-rose-500/10 text-rose-400" },
  { to: "/secure-admin/security", icon: Activity, label: "Security", color: "bg-red-500/10 text-red-400" },
  { to: "/secure-admin/settings", icon: Settings, label: "Settings", color: "bg-slate-500/10 text-slate-400" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get("/admin/analytics").then(r => setData(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Total Users", value: data?.total_users ?? 0, icon: Users, color: "bg-blue-500/10 text-blue-400" },
    { label: "Transactions", value: data?.total_transactions ?? 0, icon: Repeat, color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Wallets", value: data?.total_wallets ?? 0, icon: Wallet, color: "bg-amber-500/10 text-amber-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of the SecureMoney platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => navigate(a.to)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all ${a.color}`}>
                <a.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
          {data?.recent_users?.length ? (
            <div className="space-y-2">
              {data.recent_users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                  <span className="text-sm font-medium text-white">{u.email}</span>
                  <span className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No recent users</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
