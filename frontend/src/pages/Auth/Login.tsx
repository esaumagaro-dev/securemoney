import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";

type Step = "credentials" | "mfa" | "otp";

export default function Login() {
  const { t } = useTranslation();
  const { login, sendOtp, verifyLoginOtp, authenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authenticated && user) {
      if (user.role === "admin" || user.role === "support") {
        navigate("/secure-admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [authenticated, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (step === "otp") {
        const r = await verifyLoginOtp(email, otpCode);
        const role = r.data?.user?.role || "user";
        if (role === "admin" || role === "support") {
          navigate("/secure-admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        return;
      }

      const r = await login(email, password, mfaToken);
      if (r.status === 403) {
        if (r.data?.mfa_required) {
          setStep("mfa");
          setLoading(false);
          return;
        }
        if (r.data?.otp_required) {
          setStep("otp");
          setLoading(false);
          return;
        }
      }
      const role = r.data?.user?.role || "user";
      if (role === "admin" || role === "support") {
        navigate("/secure-admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || t("auth.login_failed", "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setOtpResending(true);
    try {
      await sendOtp(email, password);
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setOtpResending(false);
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
            {step === "otp" ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{t("auth.verify_email")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{t("auth.otp_sent", { email })}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={t("auth.otp_token")} type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} icon={<Shield className="w-4 h-4" />} placeholder="000000" required maxLength={6} />
                {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
                <Button type="submit" loading={loading} className="w-full" size="lg">{t("auth.verify")}</Button>
                <button type="button" onClick={handleResendOtp} disabled={otpResending} className="w-full text-sm text-primary font-medium hover:underline text-center disabled:opacity-50">
                  {otpResending ? t("common.loading") : t("auth.resend_otp")}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{t("auth.welcome_back")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{t("auth.enter_details")}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={t("auth.email")} type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} placeholder="you@example.com" required />
                <Input label={t("auth.password")} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} placeholder="••••••••" required
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {step === "mfa" && (
                  <Input label={t("auth.mfa_token")} type="text" value={mfaToken} onChange={e => setMfaToken(e.target.value)} icon={<Shield className="w-4 h-4" />} placeholder="000000" required />
                )}
                {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
                <Button type="submit" loading={loading} className="w-full" size="lg">{t("auth.login")}</Button>
              </form>
            </>
          )}
          {step === "credentials" && (
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.no_account")} <Link to="/register" className="text-primary font-medium hover:underline">{t("auth.sign_up")}</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
