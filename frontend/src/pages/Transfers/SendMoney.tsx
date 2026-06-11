import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, Wallet, Mail, DollarSign, FileText } from "lucide-react";
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

export default function SendMoney() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [fromWallet, setFromWallet] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get("/user/balance").then(r => {
      setWallets(r.data.wallets || []);
      if (r.data.wallets?.length > 0) setFromWallet(r.data.wallets[0].wallet_id);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromWallet || !toEmail || !amount) {
      toast.error(t("transfer.failed", "Please fill all required fields"));
      return;
    }
    setShowConfirm(true);
  }

  async function confirmTransfer() {
    setShowConfirm(false);
    setLoading(true);
    try {
      const r = await api.post("/user/transfer", {
        from_wallet: fromWallet,
        to_wallet: toEmail,
        amount: amount,
        description: description,
      });
      toast.success(t("transfer.success"));
      setAmount("");
      setToEmail("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || t("transfer.failed"));
    } finally {
      setLoading(false);
    }
  }

  const selectedWallet = wallets.find(w => w.wallet_id === fromWallet);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("transfer.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Send money securely to any SecureMoney user</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("transfer.from")}</label>
            <select
              value={fromWallet}
              onChange={e => setFromWallet(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {wallets.map(w => (
                <option key={w.wallet_id} value={w.wallet_id}>
                  {w.currency} - Balance: {parseFloat(w.balance || "0").toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t("transfer.to")}
            type="email"
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            placeholder="recipient@example.com"
            required
          />

          <Input
            label={t("transfer.amount")}
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("transfer.description")}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="What's this for?"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg" icon={<Send className="w-4 h-4" />}>
            {t("transfer.submit")}
          </Button>
        </form>
      </Card>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title={t("transfer.confirm")} maxWidth="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("transfer.from")}:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{selectedWallet?.currency || ""}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("transfer.recipient_label")}:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{toEmail}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("transfer.amount")}:</span>
              <span className="font-bold text-lg text-primary">{parseFloat(amount || "0").toLocaleString()} {selectedWallet?.currency}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1" onClick={confirmTransfer}>{t("common.confirm")}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
