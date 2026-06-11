import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, FileText, Wallet, Shield, UserPlus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../services/api";

interface AnalyticsData {
  total_users: number;
  total_transactions: number;
  total_wallets: number;
  recent_users: { id: string; email: string; created_at: string }[];
}

interface UserData {
  id: string;
  email: string;
  role: string;
  mfa_enabled: boolean;
  created_at: string;
}

interface AuditData {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip: string;
  created_at: string;
}

interface RoleData {
  id: string;
  name: string;
  permissions: Record<string, any>;
}

type Tab = "analytics" | "users" | "audit" | "roles";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("admin.dashboard")}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {(["analytics", "users", "audit", "roles"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {t(`admin.${t}` as any)}
          </button>
        ))}
      </div>

      {tab === "analytics" && <AnalyticsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "audit" && <AuditTab />}
      {tab === "roles" && <RolesTab />}
    </motion.div>
  );
}

function AnalyticsTab() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get("/admin/analytics").then(r => setData(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: t("admin.total_users"), value: data?.total_users ?? 0, icon: Users, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
    { label: t("admin.total_tx"), value: data?.total_transactions ?? 0, icon: FileText, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
    { label: t("admin.total_wallets"), value: data?.total_wallets ?? 0, icon: Wallet, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <Card key={i} padding="lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card padding="md">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t("admin.recent_users")}</h3>
        {data?.recent_users?.length ? (
          <div className="space-y-2">
            {data.recent_users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.email}</span>
                <span className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400 py-4 text-center">{t("common.no_data")}</p>}
      </Card>
    </div>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  const fetch = useCallback(async () => {
    try {
      const r = await api.get("/admin/users", { params: { page, per_page: perPage } });
      setUsers(r.data.users || []);
      setTotal(r.data.total || 0);
    } catch {}
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Card padding="none">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="px-6 py-4 text-left font-medium text-slate-500">Email</th>
            <th className="px-6 py-4 text-left font-medium text-slate-500">Role</th>
            <th className="px-6 py-4 text-left font-medium text-slate-500">MFA</th>
            <th className="px-6 py-4 text-left font-medium text-slate-500">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{u.email}</td>
              <td className="px-6 py-4"><Badge>{u.role || "user"}</Badge></td>
              <td className="px-6 py-4"><Badge variant={u.mfa_enabled ? "success" : "warning"}>{u.mfa_enabled ? "ON" : "OFF"}</Badge></td>
              <td className="px-6 py-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <EmptyState title={t("common.no_data")} />}
    </Card>
  );
}

function AuditTab() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("");

  const fetch = useCallback(async () => {
    try {
      const params: any = { page, per_page: 15 };
      if (actionFilter) params.action = actionFilter;
      const r = await api.get("/admin/audit", { params });
      setLogs(r.data.logs || []);
      setTotal(r.data.total || 0);
    } catch {}
  }, [page, actionFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-4">
      <Input placeholder={t("admin.filter_action")} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="max-w-xs" />
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-500">Action</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Resource</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">IP</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{l.action}</td>
                <td className="px-4 py-3 text-slate-500">{l.resource_type}/{l.resource_id?.slice(0, 8) || ""}</td>
                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{l.ip}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState title={t("admin.no_logs")} />}
      </Card>
    </div>
  );
}

function RolesTab() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [newName, setNewName] = useState("");

  const fetch = useCallback(async () => {
    try {
      const r = await api.get("/admin/roles");
      setRoles(r.data.roles || []);
    } catch {}
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function createRole() {
    if (!newName.trim()) return;
    try {
      await api.post("/admin/roles", { name: newName, permissions: {} });
      toast.success("Role created");
      setNewName("");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed");
    }
  }

  return (
    <div className="space-y-4">
      <Card padding="md">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t("admin.create_role")}</h3>
        <div className="flex gap-3">
          <Input placeholder={t("admin.role_name")} value={newName} onChange={e => setNewName(e.target.value)} className="flex-1" />
          <Button onClick={createRole} icon={<UserPlus className="w-4 h-4" />}>{t("common.save")}</Button>
        </div>
      </Card>
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-left font-medium text-slate-500">Name</th>
              <th className="px-6 py-4 text-left font-medium text-slate-500">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{Object.keys(r.permissions).length} permissions</td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && <EmptyState title={t("common.no_data")} />}
      </Card>
    </div>
  );
}
