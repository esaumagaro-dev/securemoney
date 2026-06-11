import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowUpFromLine, Wallet } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function Withdraw() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<any[]>([]);
  const [fromWallet, setFromWallet] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    api.get("/user/balance").then(r => {
      setWallets(r.data.wallets || []);
      if (r.data.wallets?.length > 0) setFromWallet(r.data.wallets[0].wallet_id);
    }).catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Withdrawal initiated (demo)");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("nav.withdraw")}</h1>
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("transfer.from")}</label>
            <select value={fromWallet} onChange={e => setFromWallet(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50">
              {wallets.map(w => <option key={w.wallet_id} value={w.wallet_id}>{w.currency} - {parseFloat(w.balance || "0").toLocaleString()}</option>)}
            </select>
          </div>
          <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          <Button type="submit" className="w-full" icon={<ArrowUpFromLine className="w-4 h-4" />}>Withdraw</Button>
        </form>
      </Card>
    </motion.div>
  );
}
