import React from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [wallets, setWallets] = React.useState([]);
  React.useEffect(()=> {
    async function load() {
      try {
        const token = localStorage.getItem("access_token");
        const r = await api.get("/user/balance", { headers: { Authorization: `Bearer ${token}` }});
        setWallets(r.data.wallets || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Wallets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {wallets.map(w => (
          <div key={w.wallet_id} className="p-4 bg-card rounded shadow">
            <div className="text-sm text-muted">{w.currency}</div>
            <div className="text-2xl">{w.balance}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
