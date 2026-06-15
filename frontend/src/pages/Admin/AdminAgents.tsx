import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, UserPlus, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

interface AgentData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("changeme123");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const perPage = 15;

  useEffect(() => {
    setLoading(true);
    const params: any = { page, per_page: perPage };
    if (search) params.search = search;
    api.get("/admin/agents", { params }).then(r => {
      setAgents(r.data.agents || []);
      setTotal(r.data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / perPage);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) { toast.error("Email is required"); return; }
    setCreating(true);
    try {
      await api.post("/admin/agents", { email: newEmail, password: newPassword, full_name: newName, phone: newPhone });
      toast.success("Agent created successfully");
      setShowCreate(false);
      setNewEmail("");
      setNewPassword("changeme123");
      setNewName("");
      setNewPhone("");
      setPage(1);
      const r = await api.get("/admin/agents", { params: { page: 1, per_page: perPage } });
      setAgents(r.data.agents || []);
      setTotal(r.data.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to create agent");
    } finally {
      setCreating(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage platform agents ({total})</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search agents..." className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 w-56" />
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> New Agent
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-6 py-4 text-left text-slate-400 font-medium">Name</th>
              <th className="px-6 py-4 text-left text-slate-400 font-medium">Email</th>
              <th className="px-6 py-4 text-left text-slate-400 font-medium">Phone</th>
              <th className="px-6 py-4 text-left text-slate-400 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24 animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : agents.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-slate-500">No agents found</td></tr>
            ) : (
              agents.map(a => (
                <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-white">{a.full_name || "-"}</td>
                  <td className="px-6 py-4 text-slate-300">{a.email}</td>
                  <td className="px-6 py-4 text-slate-400">{a.phone || "-"}</td>
                  <td className="px-6 py-4 text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm disabled:opacity-50"><ChevronLeft className="w-4 h-4" /> Prev</button>
          <span className="px-4 py-2 text-slate-400 text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm disabled:opacity-50">Next <ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Create Agent</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Agent name" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="agent@example.com" required className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+255 XXX XXX XXX" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button type="submit" disabled={creating} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                {creating ? "Creating..." : "Create Agent"}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
