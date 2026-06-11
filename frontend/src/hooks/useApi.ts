import { useState, useCallback } from "react";
import api from "../services/api";

export function useApi<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(url, { params });
      setData(r.data);
      return r.data;
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, fetch };
}
