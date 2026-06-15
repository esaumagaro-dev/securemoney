import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Tx {
  id: string;
  from_wallet_id?: string;
  to_wallet_id?: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  created_at: string;
}

export default function AdminWithdrawals() {
  const [txns, setTxns] = useState<Tx[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const perPage = 15;

  useEffect(() => {
    const params: any = { page, per_page: perPage, type: "withdraw" };
    if (statusFilter) params.status = statusFilter;
    api.get("/admin/transactions", { params }).then(r => { setTxns(r.data.transactions || []); setTotal(r.data.total || 0); }).catch(() => {});
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor and manage all withdrawal transactions</p>
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Amount</th>
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Currency</th>
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Status</th>
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Date</th>
          </tr></thead>
          <tbody>
            {txns.map(tx => (
              <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-4 text-white font-medium">{parseFloat(tx.amount).toLocaleString()}</td>
                <td className="px-4 py-4 text-slate-400">{tx.currency}</td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${tx.status === "completed" ? "bg-emerald-900/30 text-emerald-400" : tx.status === "failed" ? "bg-red-900/30 text-red-400" : "bg-amber-900/30 text-amber-400"}`}>{tx.status}</span>
                </td>
                <td className="px-4 py-4 text-slate-400">{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {txns.length === 0 && <p className="text-center py-12 text-slate-500">No withdrawals found</p>}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm disabled:opacity-50"><ChevronLeft className="w-4 h-4 inline" /> Prev</button>
          <span className="px-4 py-2 text-slate-400 text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm disabled:opacity-50">Next <ChevronRight className="w-4 h-4 inline" /></button>
        </div>
      )}
    </motion.div>
  );
}
