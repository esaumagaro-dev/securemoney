import React from "react";

const ThemeContext = React.createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = React.useState(localStorage.getItem("theme") || "light");
  React.useEffect(() => {
    document.documentElement.classList.remove(mode === "dark" ? "light" : "dark");
    document.documentElement.classList.add(mode);
    localStorage.setItem("theme", mode);
  }, [mode]);
  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}

export default ThemeContext;
