import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileText, DollarSign, CheckCircle, Zap, Droplets, Wifi, Home, Shield } from "lucide-react";
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

const billTypes = [
  { value: "utility", label: "Utilities", icon: Zap },
  { value: "water", label: "Water", icon: Droplets },
  { value: "internet", label: "Internet", icon: Wifi },
  { value: "rent", label: "Rent", icon: Home },
  { value: "insurance", label: "Insurance", icon: Shield },
];

export default function BillPayments() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [billType, setBillType] = useState("utility");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get("/user/balance").then(r => {
      setWallets(r.data.wallets || []);
    }).catch(() => {});
  }, []);

  const primaryWallet = wallets[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim()) { toast.error("Please enter a reference number"); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Please enter a valid amount"); return; }
    if (primaryWallet && parseFloat(amount) > parseFloat(primaryWallet.balance || "0")) { toast.error("Insufficient funds"); return; }
    setShowConfirm(true);
  }

  async function confirmPayment() {
    setShowConfirm(false);
    setLoading(true);
    try {
      const r = await api.post("/payments/bill", {
        amount,
        reference,
        bill_type: billType,
        currency: primaryWallet?.currency || "TZS",
      });
      setResult(r.data);
      toast.success(`Bill payment completed!`);
      setAmount("");
      setReference("");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Bill payment failed");
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Bill Payment Successful</h2>
          <p className="text-3xl font-bold text-primary mb-4">{parseFloat(result.amount).toLocaleString()} {result.currency}</p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm mb-6 text-left">
            <div className="flex justify-between"><span className="text-slate-500">Reference</span><span className="font-medium text-slate-900 dark:text-slate-100">{result.bill_ref}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">TXN Ref</span><span className="font-mono text-slate-900 dark:text-slate-100">{result.ref}</span></div>
          </div>
          <Button className="w-full" onClick={() => setResult(null)}>Pay Another Bill</Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("nav.bills")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pay your bills instantly</p>
      </div>

      {primaryWallet && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <FileText className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Balance: <span className="font-semibold text-slate-900 dark:text-slate-100">{parseFloat(primaryWallet.balance).toLocaleString()} {primaryWallet.currency}</span></span>
        </div>
      )}

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Reference Number" type="text" value={reference} onChange={e => setReference(e.target.value)} icon={<FileText className="w-4 h-4" />} placeholder="e.g. BILL-12345" required />

          <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} icon={<DollarSign className="w-4 h-4" />} placeholder="0.00" min="0.01" step="0.01" required />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bill Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {billTypes.map(bt => (
                <button key={bt.value} type="button" onClick={() => setBillType(bt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                    billType === bt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}>
                  <bt.icon className="w-5 h-5" />
                  <span className="font-medium">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg" icon={<FileText className="w-4 h-4" />}>
            Pay Bill
          </Button>
        </form>
      </Card>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Bill Payment" maxWidth="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Reference:</span><span className="font-medium text-slate-900 dark:text-slate-100">{reference}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Type:</span><span className="font-medium text-slate-900 dark:text-slate-100 capitalize">{billType}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Amount:</span><span className="font-bold text-lg text-primary">{parseFloat(amount || "0").toLocaleString()} {primaryWallet?.currency}</span></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1" onClick={confirmPayment}>{t("common.confirm")}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
