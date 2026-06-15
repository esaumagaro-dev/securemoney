import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function AdminNotifications() {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await api.post("/admin/notifications/broadcast", { title, message });
      toast.success("Notification broadcast sent");
      setTitle("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Broadcast Notification</h1>
        <p className="text-sm text-slate-400 mt-1">Send a notification to all platform users</p>
      </div>
      <form onSubmit={handleBroadcast} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your notification message..." rows={5} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" required />
        </div>
        <button type="submit" disabled={sending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
          <Send className="w-4 h-4" /> {sending ? "Sending..." : "Broadcast Notification"}
        </button>
      </form>
    </motion.div>
  );
}
