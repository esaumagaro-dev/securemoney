import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function Airtime() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Airtime purchase initiated (demo)");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("nav.airtime")}</h1>
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 XXX XXX XXX" required />
          <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          <Button type="submit" className="w-full" icon={<Smartphone className="w-4 h-4" />}>Buy Airtime</Button>
        </form>
      </Card>
    </motion.div>
  );
}
