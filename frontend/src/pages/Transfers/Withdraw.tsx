import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowUpFromLine, DollarSign, CheckCircle, Banknote, CreditCard, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import api from "../../services/api";

interface WalletData {
  wallet_id: string;
  currency: string;
  balance: string;
}

const methods = [
  { value: "bank_transfer", label: "Bank Transfer", icon: Banknote },
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "card", label: "Debit Card", icon: CreditCard },
];

export default function Withdraw() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [fromWallet, setFromWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get("/user/balance").then(r => {
      setWallets(r.data.wallets || []);
      if (r.data.wallets?.length > 0) setFromWallet(r.data.wallets[0].wallet_id);
    }).catch(() => {});
  }, []);

  const selectedWallet = wallets.find(w => w.wallet_id === fromWallet);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (selectedWallet && parseFloat(amount) > parseFloat(selectedWallet.balance || "0")) {
      toast.error("Insufficient funds");
      return;
    }
    setShowConfirm(true);
  }

  async function confirmWithdraw() {
    setShowConfirm(false);
    setLoading(true);
    try {
      const r = await api.post("/payments/withdraw", {
        amount,
        currency: selectedWallet?.currency || "TZS",
        method,
      });
      setResult(r.data);
      toast.success(`Withdrawal of ${r.data.amount} completed!`);
      setAmount("");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Withdrawal Successful</h2>
          <p className="text-3xl font-bold text-primary mb-4">{parseFloat(result.amount).toLocaleString()} {result.currency}</p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm mb-6 text-left">
            <div className="flex justify-between"><span className="text-slate-500">Reference</span><span className="font-mono text-slate-900 dark:text-slate-100">{result.ref}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">New Balance</span><span className="font-medium text-slate-900 dark:text-slate-100">{parseFloat(result.new_balance).toLocaleString()} {result.currency}</span></div>
          </div>
          <Button className="w-full" onClick={() => setResult(null)}>Withdraw Again</Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("nav.withdraw")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Withdraw funds from your wallet</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("transfer.from")}</label>
            <select value={fromWallet} onChange={e => setFromWallet(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50">
              {wallets.map(w => <option key={w.wallet_id} value={w.wallet_id}>{w.currency} - {parseFloat(w.balance || "0").toLocaleString()}</option>)}
            </select>
          </div>

          <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} icon={<DollarSign className="w-4 h-4" />} placeholder="0.00" min="0.01" step="0.01" required />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Withdrawal Method</label>
            <div className="grid grid-cols-1 gap-2">
              {methods.map(m => (
                <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                    method === m.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}>
                  <m.icon className="w-5 h-5" />
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg" icon={<ArrowUpFromLine className="w-4 h-4" />}>
            Withdraw
          </Button>
        </form>
      </Card>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Withdrawal" maxWidth="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">From:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{selectedWallet?.currency || ""}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-lg text-primary">{parseFloat(amount || "0").toLocaleString()} {selectedWallet?.currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Method:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">{method.replace("_", " ")}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1" onClick={confirmWithdraw}>{t("common.confirm")}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
