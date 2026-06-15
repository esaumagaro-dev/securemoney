import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Mail, Lock, User, Phone, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

type Step = "form" | "otp";

export default function Register() {
  const { t } = useTranslation();
  const { sendRegisterOtp, verifyRegisterOtp, authenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated && user) {
      if (user.role === "admin" || user.role === "support") {
        navigate("/secure-admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [authenticated, user, navigate]);
  const [form, setForm] = useState({ email: "", password: "", confirm_password: "", full_name: "", phone: "" });
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError(t("auth.passwords_mismatch", "Passwords do not match"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("auth.password_min", "Password must be at least 8 characters"));
      return;
    }
    setLoading(true);
    try {
      await sendRegisterOtp(form.email);
      setStep("otp");
      toast.success(t("auth.otp_sent_register", "OTP sent to your email!"));
    } catch (err: any) {
      setError(err.response?.data?.msg || t("auth.otp_send_failed", "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyRegisterOtp(form.email, otpCode, form.password, form.full_name, form.phone);
      toast.success(t("auth.register_success", "Account created successfully!"));
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.msg || t("auth.verification_failed", "Verification failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setOtpResending(true);
    try {
      await sendRegisterOtp(form.email);
      toast.success(t("auth.otp_resent", "OTP resent!"));
    } catch {
      setError(t("auth.otp_send_failed", "Failed to resend OTP"));
    } finally {
      setOtpResending(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <span className="text-3xl font-bold">S</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">SecureMoney</h1>
            <p className="text-xl text-white/80 max-w-md">Join thousands of users who trust SecureMoney for their financial needs.</p>
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
              <button onClick={() => setStep("form")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                <ArrowLeft className="w-4 h-4" /> {t("common.back")}
              </button>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{t("auth.verify_email")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{t("auth.otp_sent", { email: form.email })}</p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{t("auth.create_account")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{t("auth.fill_details")}</p>
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <Input label={t("auth.full_name")} type="text" value={form.full_name} onChange={update("full_name")} icon={<User className="w-4 h-4" />} placeholder="John Doe" />
                <Input label={t("auth.email")} type="email" value={form.email} onChange={update("email")} icon={<Mail className="w-4 h-4" />} placeholder="you@example.com" required />
                <Input label={t("auth.phone")} type="tel" value={form.phone} onChange={update("phone")} icon={<Phone className="w-4 h-4" />} placeholder="+255 123 456 789" />
                <Input label={t("auth.password")} type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} icon={<Lock className="w-4 h-4" />} placeholder="••••••••" required
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Input label={t("auth.confirm_password")} type={showConfirm ? "text" : "password"} value={form.confirm_password} onChange={update("confirm_password")} icon={<Lock className="w-4 h-4" />} placeholder="••••••••" required
                  rightIcon={
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="focus:outline-none" tabIndex={-1}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
                <Button type="submit" loading={loading} className="w-full" size="lg">{t("auth.sign_up")}</Button>
              </form>
            </>
          )}
          {step === "form" && (
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.have_account")} <Link to="/login" className="text-primary font-medium hover:underline">{t("auth.login")}</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
