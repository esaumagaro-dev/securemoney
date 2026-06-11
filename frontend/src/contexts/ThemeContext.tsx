import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  mode: Theme;
  resolved: "light" | "dark";
  setMode: (m: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>(null!);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const r = mode === "system" ? (mq.matches ? "dark" : "light") : mode;
      setResolved(r);
      document.documentElement.classList.toggle("dark", r === "dark");
    };
    update();
    mq.addEventListener("change", update);
    localStorage.setItem("theme", mode);
    return () => mq.removeEventListener("change", update);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
