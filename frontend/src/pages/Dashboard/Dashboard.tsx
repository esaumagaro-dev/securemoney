import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, Download, ArrowUpFromLine, ArrowDownToLine, ArrowRight, Wallet as WalletIcon, TrendingUp, Calendar } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

interface WalletData {
  wallet_id: string;
  currency: string;
  balance: string;
}

interface TxData {
  id: string;
  from_wallet_id?: string;
  to_wallet_id?: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  created_at: string;
}

const quickActions = [
  { labelKey: "Send", icon: Send, path: "/send", color: "bg-primary text-white" },
  { labelKey: "Receive", icon: Download, path: "/receive", color: "bg-emerald-500 text-white" },
  { labelKey: "Deposit", icon: ArrowDownToLine, path: "/deposit", color: "bg-blue-500 text-white" },
  { labelKey: "Withdraw", icon: ArrowUpFromLine, path: "/withdraw", color: "bg-amber-500 text-white" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "info"> = {
  completed: "success", pending: "warning", failed: "danger", transfer: "info",
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [txns, setTxns] = useState<TxData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [wRes, tRes] = await Promise.all([
          api.get("/user/balance"),
          api.get("/user/transactions", { params: { per_page: 5 } }),
        ]);
        setWallets(wRes.data.wallets || []);
        setTxns(tRes.data.transactions || []);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("dashboard.welcome")}, {user?.email?.split("@")[0] || "User"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button onClick={() => navigate("/history")} variant="outline" size="sm" icon={<Calendar className="w-4 h-4" />}>
          {t("dashboard.view_all")}
        </Button>
      </div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-br from-primary via-blue-600 to-blue-800 border-0 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <p className="text-sm text-white/70 mb-2">{t("dashboard.balance")}</p>
            <p className="text-4xl sm:text-5xl font-bold mb-2">
              {loading ? <span className="animate-pulse">---</span> : `${totalBalance.toLocaleString()} TZS`}
            </p>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Active since {new Date().getFullYear()}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <motion.div key={action.labelKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <button onClick={() => navigate(action.path)} className={`w-full p-4 rounded-2xl flex flex-col items-center gap-2 ${action.color} hover:scale-105 transition-transform duration-200 shadow-lg`}>
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{t(`dashboard.${action.labelKey.toLowerCase()}_btn` as any)}</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Wallets + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallets */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-primary" />
              {t("dashboard.wallets")}
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : wallets.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">{t("common.no_data")}</p>
          ) : (
            <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.wallet_id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{w.currency}</p>
                    <p className="text-xs text-slate-400">ID: {w.wallet_id.slice(0, 8)}...</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {parseFloat(w.balance || "0").toLocaleString()} {w.currency}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.recent")}</h2>
            <button onClick={() => navigate("/history")} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              {t("dashboard.view_all")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : txns.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">{t("dashboard.no_tx")}</p>
          ) : (
            <div className="space-y-2">
              {txns.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "transfer" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"}`}>
                      {tx.type === "transfer" ? <Send className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{tx.type}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{parseFloat(tx.amount).toLocaleString()} {tx.currency}</p>
                    <Badge variant={statusVariant[tx.status] || "default"}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Monthly Spending */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.monthly_spending")}</h2>
        </div>
        <div className="h-48 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center">
          <p className="text-sm text-slate-400">{t("common.no_data")}</p>
        </div>
      </Card>
    </motion.div>
  );
}
