import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Repeat, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import api from "../../services/api";

interface ReportData {
  total_users: number;
  total_transactions: number;
  total_deposits: number;
  total_withdrawals: number;
  total_transfers: number;
  completed_transactions: number;
  failed_transactions: number;
  users_30d: number;
  transactions_30d: number;
}

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const r = await api.get("/admin/reports");
      setData(r.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  const statCards = data ? [
    { label: "Total Users", value: data.total_users, icon: Users, color: "bg-blue-500/10 text-blue-400", change: `+${data.users_30d} in 30d` },
    { label: "Total Transactions", value: data.total_transactions, icon: Repeat, color: "bg-emerald-500/10 text-emerald-400", change: `+${data.transactions_30d} in 30d` },
    { label: "Deposits", value: data.total_deposits, icon: ArrowDownToLine, color: "bg-cyan-500/10 text-cyan-400", change: `${((data.total_deposits / Math.max(data.total_transactions, 1)) * 100).toFixed(1)}% of total` },
    { label: "Withdrawals", value: data.total_withdrawals, icon: ArrowUpFromLine, color: "bg-amber-500/10 text-amber-400", change: `${((data.total_withdrawals / Math.max(data.total_transactions, 1)) * 100).toFixed(1)}% of total` },
    { label: "Transfers", value: data.total_transfers, icon: TrendingUp, color: "bg-purple-500/10 text-purple-400", change: `${((data.total_transfers / Math.max(data.total_transactions, 1)) * 100).toFixed(1)}% of total` },
    { label: "Completed", value: data.completed_transactions, icon: Activity, color: "bg-emerald-500/10 text-emerald-400", change: `${((data.completed_transactions / Math.max(data.total_transactions, 1)) * 100).toFixed(1)}% success rate` },
    { label: "Failed", value: data.failed_transactions, icon: TrendingDown, color: "bg-red-500/10 text-red-400", change: `${((data.failed_transactions / Math.max(data.total_transactions, 1)) * 100).toFixed(1)}% failure rate` },
    { label: "30-Day Activity", value: data.transactions_30d, icon: RefreshCw, color: "bg-indigo-500/10 text-indigo-400", change: `Active transactions` },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-400 mt-1">Platform analytics and statistics</p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="h-10 w-10 bg-slate-800 rounded-2xl animate-pulse mb-3" />
              <div className="h-4 w-20 bg-slate-800 rounded animate-pulse mb-2" />
              <div className="h-7 w-16 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{s.label}</p>
                    <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.change}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Transaction Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: "Deposits", value: data?.total_deposits || 0, color: "bg-cyan-500", pct: ((data?.total_deposits || 0) / Math.max(data?.total_transactions || 1, 1)) * 100 },
                  { label: "Withdrawals", value: data?.total_withdrawals || 0, color: "bg-amber-500", pct: ((data?.total_withdrawals || 0) / Math.max(data?.total_transactions || 1, 1)) * 100 },
                  { label: "Transfers", value: data?.total_transfers || 0, color: "bg-purple-500", pct: ((data?.total_transfers || 0) / Math.max(data?.total_transactions || 1, 1)) * 100 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.value.toLocaleString()} ({item.pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Success Rate</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="2.5"
                      strokeDasharray={`${((data?.completed_transactions || 0) / Math.max(data?.total_transactions || 1, 1)) * 100} ${100 - ((data?.completed_transactions || 0) / Math.max(data?.total_transactions || 1, 1)) * 100}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{((data?.completed_transactions || 0) / Math.max(data?.total_transactions || 1, 1)) * 100 > 0 ? ((data?.completed_transactions || 0) / Math.max(data?.total_transactions || 1, 1) * 100).toFixed(0) : "0"}%</p>
                      <p className="text-xs text-slate-400">Success</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-sm text-slate-300">Completed: {data?.completed_transactions.toLocaleString()}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-sm text-slate-300">Failed: {data?.failed_transactions.toLocaleString()}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-600" /><span className="text-sm text-slate-300">Total: {data?.total_transactions.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
