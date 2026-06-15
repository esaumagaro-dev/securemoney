import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flag, FileText, Save, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

interface PageData {
  id: string;
  title: string;
  content: string;
}

export default function AdminContent() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    try {
      const r = await api.get("/admin/content");
      setPages(r.data.pages || []);
    } catch {} finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id);
    if (!editValues[id]) {
      const page = pages.find(p => p.id === id);
      if (page) setEditValues(prev => ({ ...prev, [id]: page.content }));
    }
  }

  async function handleSave(id: string) {
    const content = editValues[id];
    if (!content?.trim()) { toast.error("Content cannot be empty"); return; }
    setSaving(true);
    try {
      await api.put("/admin/content", { page_id: id, content });
      toast.success("Content updated successfully");
      setPages(prev => prev.map(p => p.id === id ? { ...p, content } : p));
      setExpanded(null);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to update content");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-sm text-slate-400 mt-1">Edit website content and copy</p>
        </div>
        <button onClick={fetchContent} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {pages.map(page => (
          <div key={page.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <button onClick={() => toggleExpand(page.id)} className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">{page.title}</p>
                  <p className="text-xs text-slate-500">ID: {page.id}</p>
                </div>
              </div>
              {expanded === page.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {expanded === page.id && (
              <div className="px-5 pb-5 space-y-3">
                <textarea
                  value={editValues[page.id] || ""}
                  onChange={e => setEditValues(prev => ({ ...prev, [page.id]: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setExpanded(null); }} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-all">Cancel</button>
                  <button onClick={() => handleSave(page.id)} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Flag className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Content Pages</h2>
          <p className="text-slate-400">Content management data is not available yet.</p>
        </div>
      )}
    </motion.div>
  );
}
