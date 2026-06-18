import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, mfa_token?: string) => Promise<any>;
  register: (email: string, password: string, full_name?: string, phone?: string) => Promise<any>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  sendOtp: (email: string, password: string) => Promise<any>;
  verifyLoginOtp: (email: string, otp: string) => Promise<any>;
  sendRegisterOtp: (email: string) => Promise<any>;
  verifyRegisterOtp: (email: string, otp: string, password: string, full_name?: string, phone?: string) => Promise<any>;
  sendPhoneOtp: (phone: string, password: string) => Promise<any>;
  verifyLoginPhoneOtp: (phone: string, otp: string) => Promise<any>;
  sendRegisterPhoneOtp: (phone: string) => Promise<any>;
  verifyRegisterPhoneOtp: (phone: string, otp: string, password: string, full_name?: string, email?: string) => Promise<any>;
  sendPhoneVerification: () => Promise<any>;
  verifyPhoneOtp: (otp: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const saved = localStorage.getItem("user");
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, mfa_token?: string) => {
    const body: any = { email, password };
    if (mfa_token) body.mfa_token = mfa_token;
    try {
      const r = await api.post("/auth/login", body);
      if (r.status === 200) {
        localStorage.setItem("access_token", r.data.access_token);
        if (r.data.refresh_token) localStorage.setItem("refresh_token", r.data.refresh_token);
        const u = r.data.user || { id: "", email, role: "user" };
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      }
      return r;
    } catch (err: any) {
      if (err.response?.status === 403) {
        return err.response;
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, full_name?: string, phone?: string) => {
    const r = await api.post("/auth/register", { email, password, full_name, phone });
    return r;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const rt = localStorage.getItem("refresh_token");
    if (!rt) throw new Error("No refresh token");
    const r = await api.post("/auth/refresh", { refresh_token: rt });
    localStorage.setItem("access_token", r.data.access_token);
    if (r.data.refresh_token) localStorage.setItem("refresh_token", r.data.refresh_token);
  }, []);

  const sendOtp = useCallback(async (email: string, password: string) => {
    const r = await api.post("/auth/otp/send", { email, password });
    return r;
  }, []);

  const verifyLoginOtp = useCallback(async (email: string, otp: string) => {
    const r = await api.post("/auth/otp/verify-login", { email, otp });
    if (r.status === 200) {
      localStorage.setItem("access_token", r.data.access_token);
      if (r.data.refresh_token) localStorage.setItem("refresh_token", r.data.refresh_token);
      const u = r.data.user || { id: "", email, role: "user" };
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    }
    return r;
  }, []);

  const sendRegisterOtp = useCallback(async (email: string) => {
    const r = await api.post("/auth/otp/send-register", { email });
    return r;
  }, []);

  const verifyRegisterOtp = useCallback(async (email: string, otp: string, password: string, full_name?: string, phone?: string) => {
    const r = await api.post("/auth/otp/verify-register", { email, otp, password, full_name, phone });
    return r;
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string, password: string) => {
    const r = await api.post("/auth/phone-otp/send", { phone, password });
    return r;
  }, []);

  const verifyLoginPhoneOtp = useCallback(async (phone: string, otp: string) => {
    const r = await api.post("/auth/phone-otp/verify-login", { phone, otp });
    if (r.status === 200) {
      localStorage.setItem("access_token", r.data.access_token);
      if (r.data.refresh_token) localStorage.setItem("refresh_token", r.data.refresh_token);
      const u = r.data.user || { id: "", email: "", role: "user" };
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    }
    return r;
  }, []);

  const sendRegisterPhoneOtp = useCallback(async (phone: string) => {
    const r = await api.post("/auth/phone-otp/send-register", { phone });
    return r;
  }, []);

  const verifyRegisterPhoneOtp = useCallback(async (phone: string, otp: string, password: string, full_name?: string, email?: string) => {
    const r = await api.post("/auth/phone-otp/verify-register", { phone, otp, password, full_name, email });
    return r;
  }, []);

  const sendPhoneVerification = useCallback(async () => {
    const r = await api.post("/auth/phone-otp/send-verification");
    return r;
  }, []);

  const verifyPhoneOtp = useCallback(async (otp: string) => {
    const r = await api.post("/auth/phone-otp/verify-phone", { otp });
    return r;
  }, []);

  return (
    <AuthContext.Provider value={{ user, authenticated: !!user, loading, login, register, logout, refreshToken, sendOtp, verifyLoginOtp, sendRegisterOtp, verifyRegisterOtp, sendPhoneOtp, verifyLoginPhoneOtp, sendRegisterPhoneOtp, verifyRegisterPhoneOtp, sendPhoneVerification, verifyPhoneOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
