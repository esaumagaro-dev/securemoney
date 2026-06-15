import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Shield, Zap, Smartphone, Globe, Lock, ArrowRight, Check,
  Menu, X, Star, ChevronDown, Download, Mail, Phone, MapPin,
  Facebook, Twitter, Instagram, Linkedin,
  TrendingUp, Users, Wallet, CreditCard, Repeat, BarChart3,
  QrCode, Send, Gift, Briefcase, Bitcoin, PiggyBank, ArrowUpRight,
  Phone as PhoneIcon, UserPlus, Coins as Coin, Sparkles, Layers
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 }
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1, duration: 0.5 }
};

export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const features = [
    { icon: Send, title: "Instant Transfers", desc: "Send money instantly to any SecureMoney user. No fees for person-to-person payments, no waiting." },
    { icon: CreditCard, title: "SecureMoney Card", desc: "Get a virtual or physical debit card linked to your wallet. Use it anywhere, online or in-store." },
    { icon: TrendingUp, title: "Invest in Stocks", desc: "Start investing with as little as $1. Buy fractional shares of top companies and grow your wealth." },
    { icon: Bitcoin, title: "Bitcoin & Crypto", desc: "Buy, sell, and hold Bitcoin and other cryptocurrencies directly from your wallet." },
    { icon: PiggyBank, title: "Savings Goals", desc: "Set savings goals and automate deposits. Watch your money grow with competitive interest rates." },
    { icon: Gift, title: "Cashback Rewards", desc: "Earn instant cashback when you pay at participating merchants. Boost your savings automatically." },
    { icon: Smartphone, title: "Mobile First", desc: "Manage your money anytime, anywhere. Pay bills, buy airtime, and control your finances from your phone." },
    { icon: Globe, title: "Multi-Currency", desc: "Hold and transact in TZS, USD, and more. Convert between currencies at competitive rates instantly." },
    { icon: QrCode, title: "QR Payments", desc: "Pay at any store by scanning a QR code. No cards, no cash, no hassle." },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">SecureMoney</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">{t("landing.nav.features")}</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">{t("landing.nav.how_it_works")}</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">{t("landing.nav.testimonials")}</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">{t("landing.nav.faq")}</a>
              <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="Toggle language">
                <span onClick={() => { i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en'); localStorage.setItem('lang', i18n.language === 'en' ? 'sw' : 'en'); }} className="text-xs font-bold uppercase cursor-pointer">{i18n.language === 'en' ? 'SW' : 'EN'}</span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => navigate("/login")} className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">{t("landing.nav.sign_in")}</button>
              <button onClick={() => navigate("/register")} className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">{t("landing.nav.get_started")}</button>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
            {[
              { key: "Features", href: "features" },
              { key: "How It Works", href: "how-it-works" },
              { key: "Testimonials", href: "testimonials" },
              { key: "FAQ", href: "faq" }
            ].map(item => (
              <a key={item.key} href={`#${item.href}`} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary">{t(`landing.nav.${item.href === "how-it-works" ? "how_it_works" : item.href}`)}</a>
            ))}
            <hr className="border-slate-100 dark:border-slate-800" />
            <button onClick={() => handleNav("/login")} className="w-full py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl">{t("landing.nav.sign_in")}</button>
            <button onClick={() => handleNav("/register")} className="w-full py-2 text-sm font-semibold bg-primary text-white rounded-xl">{t("landing.nav.get_started")}</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                {t("landing.hero.badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {t("landing.hero.title1")}{" "}
                <span className="text-primary">{t("landing.hero.title2")}</span>
                <br />{t("landing.hero.title3")}
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                {t("landing.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate("/register")} className="px-8 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg">
                  {t("landing.hero.cta")} <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => navigate("/login")} className="px-8 py-3.5 border-2 border-slate-200 dark:border-slate-700 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-lg">
                  {t("landing.hero.signin_btn")}
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-slate-500">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> {t("landing.hero.security")}</div>
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> {t("landing.hero.instant")}</div>
                <div className="flex items-center gap-2"><Gift className="w-4 h-4 text-primary" /> {t("landing.hero.cashback")}</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 bg-gradient-to-br from-primary to-blue-600 rounded-3xl shadow-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"><Wallet className="w-5 h-5" /></div>
                    <span className="text-xl font-bold">TZS</span>
                  </div>
                  <p className="text-white/70 text-sm mb-1">{t("landing.hero.mock_balance")}</p>
                  <p className="text-4xl font-bold mb-4">1,250,000</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm text-center">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1" />
                      <p className="text-xs text-white/70">{t("landing.hero.mock_investments")}</p>
                      <p className="text-sm font-bold">TZS 45,000</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm text-center">
                      <Bitcoin className="w-4 h-4 mx-auto mb-1" />
                      <p className="text-xs text-white/70">{t("landing.hero.mock_bitcoin")}</p>
                      <p className="text-sm font-bold">0.0012 BTC</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2"><Send className="w-4 h-4" /><span className="text-sm">{t("landing.hero.mock_send")}</span></div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /><span className="text-sm">{t("landing.hero.mock_card")}</span></div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", labelKey: "landing.stats.users", icon: Users },
              { value: "50K+", labelKey: "landing.stats.transactions", icon: Repeat },
              { value: "99.9%", labelKey: "landing.stats.uptime", icon: Shield },
              { value: "4.8", labelKey: "landing.stats.rating", icon: Star },
            ].map((s, i) => (
              <motion.div key={i} {...stagger} className="text-center">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{t(s.labelKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.how.title")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t("landing.how.subtitle")}</p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Download, step: 1, titleKey: "landing.how.step1_title", descKey: "landing.how.step1_desc" },
              { icon: Wallet, step: 2, titleKey: "landing.how.step2_title", descKey: "landing.how.step2_desc" },
              { icon: Zap, step: 3, titleKey: "landing.how.step3_title", descKey: "landing.how.step3_desc" },
            ].map((item, i) => (
              <motion.div key={i} {...stagger} className="text-center relative">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 relative">
                  <item.icon className="w-10 h-10" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{item.step}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.features.title")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t("landing.features.subtitle")}</p>
          </motion.div>
          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => {
              const num = i + 1;
              return (
                <motion.div key={i} {...stagger} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-primary/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    {React.createElement(features[i].icon, { className: "w-6 h-6" })}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(`landing.features.f${num}_title`)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(`landing.features.f${num}_desc`)}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CASH CARD SECTION */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <CreditCard className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.card.title")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{t("landing.card.subtitle")}</p>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{t(`landing.card.item${i + 1}`)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/register")} className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2">
                {t("landing.card.cta")} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
            <motion.div {...fadeUp} className="hidden lg:flex justify-center">
              <div className="w-80 h-52 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-white font-bold text-xs">S</span></div>
                    <span className="text-white font-bold">SecureMoney</span>
                  </div>
                  <CreditCard className="w-6 h-6 text-white/60" />
                </div>
                <div>
                  <p className="text-lg text-white/80 font-mono tracking-widest mb-2">**** **** **** 4829</p>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>VALID THRU 12/28</span>
                    <span>VISA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INVEST & CRYPTO SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="order-2 lg:order-1 hidden lg:flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">+12.5%</p>
                  <p className="text-xs text-slate-500">{t("landing.invest.stat1")}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center">
                  <Bitcoin className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">$72,450</p>
                  <p className="text-xs text-slate-500">{t("landing.invest.stat2")}</p>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.invest.title")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{t("landing.invest.subtitle")}</p>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{t(`landing.invest.item${i + 1}`)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CASHBACK REWARDS */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-6">
                <Gift className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.cashback.title")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{t("landing.cashback.subtitle")}</p>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{t(`landing.cashback.item${i + 1}`)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/register")} className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2">
                {t("landing.cashback.cta")} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
            <motion.div {...fadeUp} className="hidden lg:flex justify-center">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 w-72 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{t("landing.cashback.boosts_title")}</h3>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{t(`landing.cashback.boost${i + 1}`)}</span>
                      <span className={`text-sm font-bold text-white px-2 py-0.5 rounded-lg ${["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"][i]}`}>{["5%", "3%", "10%", "7%"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.security.title")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{t("landing.security.subtitle")}</p>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{t(`landing.security.item${i + 1}`)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="hidden lg:flex justify-center">
              <div className="w-72 h-80 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl p-8 text-white flex flex-col justify-center">
                <Lock className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">{t("landing.security.card_title")}</h3>
                <p className="text-white/80 text-sm">{t("landing.security.card_desc")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* REFERRAL PROGRAM */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <UserPlus className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.referral.title")}</h2>
              <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">{t("landing.referral.subtitle")}</p>
              <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 font-bold text-lg">{i + 1}</div>
                    <h4 className="font-semibold mb-1">{t(`landing.referral.step${i + 1}_title`)}</h4>
                    <p className="text-sm text-white/70">{t(`landing.referral.step${i + 1}_desc`)}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/register")} className="px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-slate-100 transition-all">
                {t("landing.referral.cta")}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.testimonials.title")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t("landing.testimonials.subtitle")}</p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} {...stagger} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex gap-1 mb-4">
                  {Array.from({length: 5}).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">{t(`landing.testimonials.t${i + 1}_text`)}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">{t(`landing.testimonials.t${i + 1}_name`)[0]}</div>
                  <div>
                    <p className="text-sm font-semibold">{t(`landing.testimonials.t${i + 1}_name`)}</p>
                    <p className="text-xs text-slate-400">{t(`landing.testimonials.t${i + 1}_role`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.faq.title")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t("landing.faq.subtitle")}</p>
          </motion.div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} {...fadeUp} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="font-medium">{t(`landing.faq.q${i + 1}`)}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(`landing.faq.a${i + 1}`)}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.cta.title")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">{t("landing.cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate("/register")} className="px-10 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 text-lg flex items-center justify-center gap-2">
                {t("landing.cta.button")} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> {t("landing.cta.badge1")}</div>
              <div className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> {t("landing.cta.badge2")}</div>
              <div className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> {t("landing.cta.badge3")}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">S</span></div>
                <span className="font-bold text-lg text-white">SecureMoney</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{t("landing.footer.desc")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t("landing.footer.product_title")}</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-white cursor-pointer">{t("landing.footer.product1")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.product2")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.product3")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.product4")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.product5")}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t("landing.footer.company_title")}</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-white cursor-pointer">{t("landing.footer.company1")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.company2")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.company3")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.company4")}</p>
                <p className="hover:text-white cursor-pointer">{t("landing.footer.company5")}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t("landing.footer.contact_title")}</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> hello@securemoney.co.tz</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> 0680 555 982</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {t("landing.footer.address")}</div>
              </div>
              <div className="flex gap-3 mt-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
