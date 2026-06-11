import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Shield, Smartphone, CheckCircle, XCircle, Key } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import api from "../../services/api";

export default function Security() {
  const { t } = useTranslation();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [qrUri, setQrUri] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api.get("/user/profile").then(r => {
      setMfaEnabled(r.data.mfa_enabled || false);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSetup() {
    try {
      const r = await api.post("/auth/mfa/setup");
      setSecret(r.data.secret);
      setQrUri(r.data.uri);
      setSetupMode(true);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "MFA setup failed");
    }
  }

  async function handleVerify() {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      await api.post("/auth/mfa/verify", { mfa_token: verifyCode });
      setMfaEnabled(true);
      setSetupMode(false);
      setVerifyCode("");
      toast.success(t("mfa.success"));
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("security.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account security settings</p>
      </div>

      {/* MFA Section */}
      <Card padding="lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("security.mfa")}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("security.mfa_desc")}</p>
            </div>
          </div>
          <Badge variant={mfaEnabled ? "success" : "warning"}>{mfaEnabled ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}</Badge>
        </div>

        {!setupMode && (
          <Button onClick={handleSetup} variant={mfaEnabled ? "danger" : "primary"} icon={<Shield className="w-4 h-4" />}>
            {mfaEnabled ? t("security.disable") : t("security.enable")}
          </Button>
        )}

        {setupMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4">
            <div className="flex justify-center">
              {qrUri ? (
                <div className="p-4 bg-white rounded-2xl shadow-lg inline-block">
                  <QRCodeSVG value={qrUri} size={200} level="H" />
                </div>
              ) : (
                <div className="w-[200px] h-[200px] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              )}
            </div>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">{t("security.scan_qr")}</p>
            <Input
              label={t("security.enter_code")}
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              icon={<Key className="w-4 h-4" />}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSetupMode(false)}>{t("common.cancel")}</Button>
              <Button className="flex-1" onClick={handleVerify} loading={verifying}>{t("security.verify")}</Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Security Info */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Device Security</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your account is protected with Argon2 password hashing and AES-256-GCM encryption for all sensitive data.</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
