import React from "react";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  const [authenticated, setAuthenticated] = React.useState(false);
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {authenticated ? <Dashboard /> : <Login onAuth={() => setAuthenticated(true)} />}
      </div>
    </ThemeProvider>
  );
}
