import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await login(email, password);
      if (r.status === 200) {
        const role = r.data?.user?.role || "user";
        if (role === "admin" || role === "support") {
          navigate("/secure-admin/dashboard");
        } else {
          setError("Access denied. Admin credentials required.");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Authorized personnel only</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} placeholder="admin@securemoney.com" required className="bg-slate-800 border-slate-700 text-white" />
          <Input label="Password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} placeholder="Enter password" required className="bg-slate-800 border-slate-700 text-white"
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            }
          />
          {error && <div className="p-3 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>}
          <Button type="submit" loading={loading} className="w-full" size="lg">Sign In to Admin</Button>
        </form>
      </motion.div>
    </div>
  );
}
