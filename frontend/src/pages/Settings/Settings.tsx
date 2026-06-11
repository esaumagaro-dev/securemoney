import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, Sun, Moon, Monitor, Check } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { mode, setMode } = useTheme();

  const languages = [
    { code: "en", label: "English" },
    { code: "sw", label: "Kiswahili" },
  ];

  const themes = [
    { value: "light" as const, label: t("settings.light"), icon: Sun },
    { value: "dark" as const, label: t("settings.dark"), icon: Moon },
    { value: "system" as const, label: t("settings.system"), icon: Monitor },
  ];

  function changeLang(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    toast.success("Language changed");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("settings.title")}</h1>
      </div>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          {t("settings.language")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                i18n.language === l.code
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{l.label}</span>
                {i18n.language === l.code && <Check className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary" />
          {t("settings.theme")}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(th => (
            <button
              key={th.value}
              onClick={() => setMode(th.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                mode === th.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <th.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{th.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
