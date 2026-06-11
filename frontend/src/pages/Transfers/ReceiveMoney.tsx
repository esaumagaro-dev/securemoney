import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Download, Copy, Check, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";

interface WalletData {
  wallet_id: string;
  currency: string;
  balance: string;
}

export default function ReceiveMoney() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/user/balance").then(r => {
      setWallets(r.data.wallets || []);
      if (r.data.wallets?.length > 0) setSelectedWallet(r.data.wallets[0].wallet_id);
    }).catch(() => {});
  }, []);

  async function copyAddress() {
    if (!selectedWallet) return;
    try {
      await navigator.clipboard.writeText(selectedWallet);
      setCopied(true);
      toast.success(t("receive.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("receive.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("receive.share")}</p>
      </div>

      <Card padding="lg" className="text-center">
        <div className="space-y-1.5 mb-6 text-left">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Wallet</label>
          <select
            value={selectedWallet}
            onChange={e => setSelectedWallet(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {wallets.map(w => (
              <option key={w.wallet_id} value={w.wallet_id}>{w.currency}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center mb-6">
          {selectedWallet ? (
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block">
              <QRCodeSVG value={selectedWallet} size={200} level="H" />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
              <Wallet className="w-12 h-12" />
            </div>
          )}
        </div>

        <Button onClick={copyAddress} variant={copied ? "secondary" : "primary"} className="w-full" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
          {copied ? t("receive.copied") : t("receive.copy")}
        </Button>

        {selectedWallet && (
          <p className="mt-4 text-xs text-slate-400 font-mono break-all bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            {selectedWallet}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
