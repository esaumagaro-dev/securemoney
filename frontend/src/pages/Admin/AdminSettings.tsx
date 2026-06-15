import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Globe, Lock, Clock, DollarSign, Users, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "SecureMoney",
    support_email: "support@securemoney.com",
    maintenance_mode: false,
    registration_open: true,
    default_currency: "TZS",
    min_withdrawal: "1000",
    max_withdrawal: "10000000",
    session_timeout: "30",
    mfa_required: false,
  });

  useEffect(() => {
    api.get("/admin/settings").then(r => {
      if (r.data) setSettings(prev => ({ ...prev, ...r.data }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-96 bg-slate-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure platform-wide settings</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">General</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Site Name</label>
              <input value={settings.site_name} onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Support Email</label>
              <input value={settings.support_email} onChange={e => setSettings(s => ({ ...s, support_email: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-400">Block all user access except admins</p>
              </div>
              <button type="button" onClick={() => setSettings(s => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
                className={`w-12 h-6 rounded-full transition-all ${settings.maintenance_mode ? "bg-primary" : "bg-slate-700"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.maintenance_mode ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Registration Open</p>
                <p className="text-xs text-slate-400">Allow new users to register</p>
              </div>
              <button type="button" onClick={() => setSettings(s => ({ ...s, registration_open: !s.registration_open }))}
                className={`w-12 h-6 rounded-full transition-all ${settings.registration_open ? "bg-primary" : "bg-slate-700"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.registration_open ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Require MFA</p>
                <p className="text-xs text-slate-400">Force all users to enable 2FA</p>
              </div>
              <button type="button" onClick={() => setSettings(s => ({ ...s, mfa_required: !s.mfa_required }))}
                className={`w-12 h-6 rounded-full transition-all ${settings.mfa_required ? "bg-primary" : "bg-slate-700"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.mfa_required ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </label>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Financial</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Default Currency</label>
              <select value={settings.default_currency} onChange={e => setSettings(s => ({ ...s, default_currency: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="KES">KES</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Withdrawal</label>
              <input type="number" value={settings.min_withdrawal} onChange={e => setSettings(s => ({ ...s, min_withdrawal: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Withdrawal</label>
              <input type="number" value={settings.max_withdrawal} onChange={e => setSettings(s => ({ ...s, max_withdrawal: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Session</h3>
          </div>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Session Timeout (minutes)</label>
            <input type="number" value={settings.session_timeout} onChange={e => setSettings(s => ({ ...s, session_timeout: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </section>

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </motion.div>
  );
}
