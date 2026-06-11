import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import api from "../../services/api";

interface ProfileData {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
  mfa_enabled: boolean;
  created_at: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    api.get("/user/profile").then(r => setProfile(r.data)).catch(() => {});
  }, []);

  if (!profile) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("profile.title")}</h1>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {profile.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profile.full_name || "User"}</h2>
            <p className="text-sm text-slate-500">{profile.role || "user"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">{t("profile.email")}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">{t("profile.phone")}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profile.phone || t("common.no_data")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Shield className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">MFA</p>
              <Badge variant={profile.mfa_enabled ? "success" : "warning"}>{profile.mfa_enabled ? "Enabled" : "Disabled"}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">{t("profile.member_since")}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
