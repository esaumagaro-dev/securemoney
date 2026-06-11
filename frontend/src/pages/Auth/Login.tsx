import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Mail, Lock, Shield } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = mfaRequired
        ? await login(email, password, mfaToken)
        : await login(email, password);
      if (r.status === 403 && r.data?.mfa_required) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.msg || t("auth.login_failed", "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <span className="text-3xl font-bold">S</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">SecureMoney</h1>
            <p className="text-xl text-white/80 max-w-md">Secure digital wallet platform with end-to-end encryption for your financial transactions.</p>
          </motion.div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-100">SecureMoney</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{t("auth.welcome_back")}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{t("auth.enter_details")}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t("auth.email")} type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} placeholder="you@example.com" required />
            <Input label={t("auth.password")} type="password" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} placeholder="••••••••" required />
            {mfaRequired && (
              <Input label={t("auth.mfa_token")} type="text" value={mfaToken} onChange={e => setMfaToken(e.target.value)} icon={<Shield className="w-4 h-4" />} placeholder="000000" required />
            )}
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <Button type="submit" loading={loading} className="w-full" size="lg">{t("auth.login")}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("auth.no_account")} <Link to="/register" className="text-primary font-medium hover:underline">{t("auth.sign_up")}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
