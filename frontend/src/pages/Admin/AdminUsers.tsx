import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Shield, ShieldOff } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  role: string;
  mfa_enabled: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const perPage = 15;

  useEffect(() => {
    const params: any = { page, per_page: perPage };
    if (search) params.search = search;
    api.get("/admin/users", { params }).then(r => { setUsers(r.data.users || []); setTotal(r.data.total || 0); }).catch(() => {});
  }, [page, search]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 w-64" />
        </div>
      </div>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Email</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Role</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">MFA</th>
            <th className="px-6 py-4 text-left text-slate-400 font-medium">Joined</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-6 py-4 text-white">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300">{u.role || "user"}</span>
                </td>
                <td className="px-6 py-4">
                  {u.mfa_enabled ? <Shield className="w-4 h-4 text-emerald-400" /> : <ShieldOff className="w-4 h-4 text-slate-600" />}
                </td>
                <td className="px-6 py-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-12 text-slate-500">No users found</p>}
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
