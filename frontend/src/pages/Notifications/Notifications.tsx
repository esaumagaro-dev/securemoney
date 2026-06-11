import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Send, Shield, Info } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../services/api";

interface NotifData {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <Send className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

export default function Notifications() {
  const { t } = useTranslation();
  const [notifs, setNotifs] = useState<NotifData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/user/notifications").then(r => {
      setNotifs(r.data.notifications || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function markRead() {
    try {
      await api.post("/user/notifications/read");
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("Marked all as read");
    } catch {}
  }

  const unread = notifs.filter(n => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("notifications.title")}</h1>
          {unread > 0 && <p className="text-sm text-slate-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markRead} icon={<CheckCheck className="w-4 h-4" />}>
            {t("notifications.mark_read")}
          </Button>
        )}
      </div>

      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : notifs.length === 0 ? (
          <EmptyState icon={<Bell className="w-8 h-8" />} title={t("notifications.no_notifications")} />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifs.map(n => (
              <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? "bg-primary/5" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !n.read ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}>
                  {typeIcons[n.type] || <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
