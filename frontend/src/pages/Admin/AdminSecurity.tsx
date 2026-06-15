import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip: string;
  created_at: string;
}

export default function AdminSecurity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const perPage = 15;

  useEffect(() => {
    const params: any = { page, per_page: perPage };
    if (actionFilter) params.action = actionFilter;
    api.get("/admin/audit", { params }).then(r => { setLogs(r.data.logs || []); setTotal(r.data.total || 0); }).catch(() => {});
  }, [page, actionFilter]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Audit Log</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor all security events and administrative actions</p>
        </div>
        <input value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} placeholder="Filter by action..." className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 w-64" />
      </div>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Action</th>
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Resource</th>
            <th className="px-4 py-4 text-left text-slate-400 font-medium">IP</th>
            <th className="px-4 py-4 text-left text-slate-400 font-medium">Date</th>
          </tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-4 text-white">{l.action}</td>
                <td className="px-4 py-4 text-slate-400">{l.resource_type}/{l.resource_id?.slice(0, 8) || ""}</td>
                <td className="px-4 py-4 text-slate-400 text-xs font-mono">{l.ip}</td>
                <td className="px-4 py-4 text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Activity className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-500">No audit logs found</p>
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
