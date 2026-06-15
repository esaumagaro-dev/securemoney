import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";

interface WalletData {
  id: string;
  user_id: string;
  balance: string;
  currency: string;
  active: boolean;
  created_at: string;
}

export default function AdminWallets() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;

  useEffect(() => {
    api.get("/admin/wallets", { params: { page, per_page: perPage } })
      .then(r => { setWallets(r.data.wallets || []); setTotal(r.data.total || 0); })
      .catch(() => {});
  }, [page]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet Overview</h1>
        <p className="text-sm text-slate-400 mt-1">View all wallets across the platform</p>
      </div>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Wallet ID</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Balance</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Currency</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Active</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Created</th>
          </tr></thead>
          <tbody>
            {wallets.map(w => (
              <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-6 py-4 text-white font-mono text-xs">{w.id.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-white font-medium">{parseFloat(w.balance).toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-400">{w.currency}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${w.active ? "bg-emerald-900/30 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>{w.active ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-6 py-4 text-slate-400">{new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {wallets.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Wallet className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-500">No wallets found</p>
          </div>
        )}
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
