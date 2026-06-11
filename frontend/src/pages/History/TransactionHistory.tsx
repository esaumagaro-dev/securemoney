import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Clock, Search, ChevronLeft, ChevronRight, Send, Download, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../services/api";

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

const statusVariant: Record<string, "success" | "warning" | "danger" | "info"> = {
  completed: "success", pending: "warning", failed: "danger",
};

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <Send className="w-4 h-4" />,
  deposit: <ArrowDownToLine className="w-4 h-4" />,
  withdraw: <ArrowUpFromLine className="w-4 h-4" />,
  receive: <Download className="w-4 h-4" />,
};

export default function TransactionHistory() {
  const { t } = useTranslation();
  const [txns, setTxns] = useState<TxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const perPage = 10;

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/user/transactions", { params: { page, per_page: perPage } });
      setTxns(r.data.transactions || []);
      setTotal(r.data.total || 0);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  const filtered = search
    ? txns.filter(t => t.id.toLowerCase().includes(search.toLowerCase()))
    : txns;
  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("history.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} total transactions</p>
        </div>
        <Input
          placeholder={t("history.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="sm:w-64"
        />
      </div>

      <Card padding="none">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">{t("history.amount")}</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">{t("history.status")}</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">{t("history.date")}</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="capitalize text-slate-900 dark:text-slate-100">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{parseFloat(tx.amount).toLocaleString()} {tx.currency}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[tx.status] || "default"}>{tx.status}</Badge></td>
                  <td className="px-6 py-4 text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{tx.id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((tx) => (
            <div key={tx.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    {typeIcons[tx.type] || <Send className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">{tx.type}</span>
                </div>
                <Badge variant={statusVariant[tx.status] || "default"}>{tx.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{tx.currency}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{parseFloat(tx.amount).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && <EmptyState title={t("history.no_tx")} />}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} icon={<ChevronLeft className="w-4 h-4" />}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} icon={<ChevronRight className="w-4 h-4" />}>
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
}
