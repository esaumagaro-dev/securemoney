import React from "react";
import api from "../../services/api";

export default function Login({ onAuth }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post("/auth/login", { email, password });
      if (r.status === 200) {
        localStorage.setItem("access_token", r.data.access_token);
        onAuth();
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">SecureMoney</h1>
      <form onSubmit={submit} className="space-y-4">
        <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 rounded border" placeholder="Email" />
        <input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 rounded border" placeholder="Password" />
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="w-full py-3 bg-primary text-white rounded">Sign in</button>
      </form>
    </div>
  );
}
